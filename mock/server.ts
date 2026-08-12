import { mock, getSnapshot } from './data';

// Simple in-memory mock server that intercepts `fetch` calls to `/api/*`.
// It responds with JSON based on the single `mock` data file.

const originalFetch = (globalThis as any).fetch.bind(globalThis);

function jsonResponse(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

function parseUrl(input: string) {
  try {
    // Ensure absolute URL parsing works in browser and Node envs
    const base = typeof window !== 'undefined' ? window.location.origin : 'http://localhost';
    return new URL(input, base);
  } catch (e) {
    return null;
  }
}

function nextId(arr: any[]) {
  return arr.length ? Math.max(...arr.map((x: any) => x.id || 0)) + 1 : 1;
}

(globalThis as any).fetch = async (input: RequestInfo, init?: RequestInit) => {
  // Mock server disabled: forward all API requests directly to live SSL API backend
  return originalFetch(input, init);
  const url = parseUrl(urlStr || '');
  if (!url) return originalFetch(input, init);

  // Bypass mock server for external API requests (like the real hosted API base URL)
  const isExternal = typeof window !== 'undefined'
    ? (url.origin !== window.location.origin)
    : (url.origin !== 'http://localhost');

  if (isExternal) return originalFetch(input, init);

  // Bypass mock server for real API reset-password-request & change-password endpoints
  if (url.pathname.includes('reset-password-request') || url.pathname.includes('change-password')) {
    return originalFetch(input, init);
  }

  if (!url.pathname.startsWith('/api/')) return originalFetch(input, init);

  const method = (init && init.method) || 'GET';

  // Provide a small artificial delay for realism
  await new Promise(res => setTimeout(res, 100));

  try {
    // Route handling
    if (url.pathname === '/api/courses' && method === 'GET') {
      return jsonResponse(getSnapshot().courses);
    }

    if (url.pathname === '/api/pricing' && method === 'GET') {
      return jsonResponse(getSnapshot().pricing);
    }

    if (url.pathname === '/api/addons' && method === 'GET') {
      return jsonResponse(getSnapshot().addons);
    }

    if (url.pathname === '/api/carousel' && method === 'GET') {
      return jsonResponse(getSnapshot().carousel);
    }

    if (url.pathname === '/api/bookings/check' && method === 'GET') {
      const date = url.searchParams.get('date');
      const courseType = url.searchParams.get('courseType');
      const booked = getSnapshot().bookings.filter((b: any) => b.date === date && b.courseType === courseType && b.status !== 'cancelled');
      return jsonResponse(booked.map((b: any) => b.time));
    }

    if (url.pathname === '/api/bookings' && method === 'GET') {
      return jsonResponse(getSnapshot().bookings);
    }

    if (url.pathname === '/api/bookings' && method === 'POST') {
      const bodyText = init && init.body ? String(init.body) : '';
      const payload = bodyText ? JSON.parse(bodyText) : {};
      const newBooking = { id: nextId((mock as any).bookings), ...payload, createdAt: new Date().toISOString() };
      (mock as any).bookings.push(newBooking);
      return jsonResponse({ success: true, id: newBooking.id });
    }

    if (url.pathname === '/api/users' && method === 'GET') {
      return jsonResponse(getSnapshot().users.map((u: any) => ({ ...u, permissions: JSON.parse(u.permissions || '[]') })));
    }

    if (url.pathname === '/api/logs' && method === 'GET') {
      return jsonResponse(getSnapshot().activity_logs);
    }

    if (url.pathname === '/api/members' && method === 'GET') {
      return jsonResponse(getSnapshot().users.filter((u: any) => u.role === 'Member'));
    }

    if (url.pathname === '/api/login' && method === 'POST') {
      const bodyText = init && init.body ? String(init.body) : '';
      const { username, email, password } = bodyText ? JSON.parse(bodyText) : {};
      const users = getSnapshot().users;
      const user = users.find((u: any) => (email && u.email === email) || (username && u.username === username));
      if (user && user.password === password) {
        return jsonResponse({ success: true, token: 'auth-token-123', id: user.id, username: user.username, role: user.role, permissions: JSON.parse(user.permissions || '[]'), email: user.email, phone: user.phone, avatar: user.avatar });
      }
      return jsonResponse({ success: false, message: 'Invalid credentials' }, 401);
    }

    if (url.pathname === '/api/register' && method === 'POST') {
      const bodyText = init && init.body ? String(init.body) : '';
      const { username, password, email, phone } = bodyText ? JSON.parse(bodyText) : {};
      if ((mock as any).users.find((u: any) => u.username === username)) {
        return jsonResponse({ success: false, message: 'Username already exists' }, 400);
      }
      if (email && (mock as any).users.find((u: any) => u.email === email)) {
        return jsonResponse({ success: false, message: 'Email already exists' }, 400);
      }
      const newUser = { id: nextId((mock as any).users), username, password, role: 'Member', permissions: JSON.stringify([]), email: email || null, phone: phone || null, avatar: null };
      (mock as any).users.push(newUser);
      return jsonResponse({ success: true, token: 'auth-token-123', id: newUser.id, username: newUser.username, role: newUser.role, permissions: [], email: newUser.email, phone: newUser.phone, avatar: newUser.avatar });
    }

    // Genders GET & POST
    if (url.pathname === '/api/v1/genders') {
      if (method === 'GET') {
        return jsonResponse({ success: true, message: 'OK', data: getSnapshot().genders });
      }
      if (method === 'POST') {
        const bodyText = init && init.body ? String(init.body) : '';
        const { code, label, sort_order } = bodyText ? JSON.parse(bodyText) : {};
        if (!code || !label) {
          return jsonResponse({ success: false, message: 'Validation failed.', errors: { code: ['Code is required'], label: ['Label is required'] } }, 400);
        }
        if ((mock as any).genders.find((g: any) => g.code === code)) {
          return jsonResponse({ success: false, message: 'Validation failed.', errors: { code: ['This code is already registered.'] } }, 400);
        }
        const newGender = { id: nextId((mock as any).genders), code, label, sort_order: Number(sort_order) || 0, is_system: false };
        (mock as any).genders.push(newGender);
        return jsonResponse({ success: true, message: 'Created.', data: newGender });
      }
    }

    // Genders PUT & DELETE
    if (url.pathname.startsWith('/api/v1/genders/')) {
      const id = Number(url.pathname.split('/').pop());
      const idx = (mock as any).genders.findIndex((g: any) => g.id === id);
      if (idx !== -1) {
        if (method === 'PATCH' || method === 'PUT') {
          const bodyText = init && init.body ? String(init.body) : '';
          const { code, label, sort_order } = bodyText ? JSON.parse(bodyText) : {};
          const gender = (mock as any).genders[idx];
          gender.code = code || gender.code;
          gender.label = label || gender.label;
          gender.sort_order = Number(sort_order) || gender.sort_order;
          return jsonResponse({ success: true, message: 'Updated.', data: gender });
        }
        if (method === 'DELETE') {
          if ((mock as any).genders[idx].is_system) {
            return jsonResponse({ success: false, message: 'Cannot delete system record.' }, 403);
          }
          (mock as any).genders.splice(idx, 1);
          return jsonResponse({ success: true, message: 'Deleted successfully.' });
        }
      } else {
        return jsonResponse({ success: false, message: 'Gender not found.' }, 404);
      }
    }

    // User Statuses GET & POST
    if (url.pathname === '/api/v1/user-statuses') {
      if (method === 'GET') {
        return jsonResponse({ success: true, message: 'OK', data: getSnapshot().user_statuses });
      }
      if (method === 'POST') {
        const bodyText = init && init.body ? String(init.body) : '';
        const { code, label, sort_order } = bodyText ? JSON.parse(bodyText) : {};
        if (!code || !label) {
          return jsonResponse({ success: false, message: 'Validation failed.', errors: { code: ['Code is required'], label: ['Label is required'] } }, 400);
        }
        if ((mock as any).user_statuses.find((s: any) => s.code === code)) {
          return jsonResponse({ success: false, message: 'Validation failed.', errors: { code: ['This code is already registered.'] } }, 400);
        }
        const newStatus = { id: nextId((mock as any).user_statuses), code, label, sort_order: Number(sort_order) || 0, is_system: false };
        (mock as any).user_statuses.push(newStatus);
        return jsonResponse({ success: true, message: 'Created.', data: newStatus });
      }
    }

    // User Statuses PUT & DELETE
    if (url.pathname.startsWith('/api/v1/user-statuses/')) {
      const id = Number(url.pathname.split('/').pop());
      const idx = (mock as any).user_statuses.findIndex((s: any) => s.id === id);
      if (idx !== -1) {
        if (method === 'PATCH' || method === 'PUT') {
          const bodyText = init && init.body ? String(init.body) : '';
          const { code, label, sort_order } = bodyText ? JSON.parse(bodyText) : {};
          const statusItem = (mock as any).user_statuses[idx];
          statusItem.code = code || statusItem.code;
          statusItem.label = label || statusItem.label;
          statusItem.sort_order = Number(sort_order) || statusItem.sort_order;
          return jsonResponse({ success: true, message: 'Updated.', data: statusItem });
        }
        if (method === 'DELETE') {
          if ((mock as any).user_statuses[idx].is_system) {
            return jsonResponse({ success: false, message: 'Cannot delete system record.' }, 403);
          }
          (mock as any).user_statuses.splice(idx, 1);
          return jsonResponse({ success: true, message: 'Deleted successfully.' });
        }
      } else {
        return jsonResponse({ success: false, message: 'User status not found.' }, 404);
      }
    }

    // Project Statuses GET & POST
    if (url.pathname === '/api/v1/project-statuses') {
      if (method === 'GET') {
        return jsonResponse({ success: true, message: 'OK', data: getSnapshot().project_statuses });
      }
      if (method === 'POST') {
        const bodyText = init && init.body ? String(init.body) : '';
        const { code, label, sort_order } = bodyText ? JSON.parse(bodyText) : {};
        if (!code || !label) {
          return jsonResponse({ success: false, message: 'Validation failed.', errors: { code: ['Code is required'], label: ['Label is required'] } }, 400);
        }
        if ((mock as any).project_statuses.find((s: any) => s.code === code)) {
          return jsonResponse({ success: false, message: 'Validation failed.', errors: { code: ['This code is already registered.'] } }, 400);
        }
        const newStatus = { id: nextId((mock as any).project_statuses), code, label, sort_order: Number(sort_order) || 0, is_system: false };
        (mock as any).project_statuses.push(newStatus);
        return jsonResponse({ success: true, message: 'Created.', data: newStatus });
      }
    }

    // Project Statuses PATCH & DELETE
    if (url.pathname.startsWith('/api/v1/project-statuses/')) {
      const id = Number(url.pathname.split('/').pop());
      const idx = (mock as any).project_statuses.findIndex((s: any) => s.id === id);
      if (idx !== -1) {
        if (method === 'PATCH' || method === 'PUT') {
          const bodyText = init && init.body ? String(init.body) : '';
          const { code, label, sort_order } = bodyText ? JSON.parse(bodyText) : {};
          const statusItem = (mock as any).project_statuses[idx];
          statusItem.code = code || statusItem.code;
          statusItem.label = label || statusItem.label;
          statusItem.sort_order = Number(sort_order) || statusItem.sort_order;
          return jsonResponse({ success: true, message: 'Updated.', data: statusItem });
        }
        if (method === 'DELETE') {
          if ((mock as any).project_statuses[idx].is_system) {
            return jsonResponse({ success: false, message: 'Cannot delete system record.' }, 403);
          }
          (mock as any).project_statuses.splice(idx, 1);
          return jsonResponse({ success: true, message: 'Deleted successfully.' });
        }
      } else {
        return jsonResponse({ success: false, message: 'Project status not found.' }, 404);
      }
    }

    // Milestone Statuses GET & POST
    if (url.pathname === '/api/v1/milestone-statuses') {
      if (method === 'GET') {
        return jsonResponse({ success: true, message: 'OK', data: getSnapshot().milestone_statuses });
      }
      if (method === 'POST') {
        const bodyText = init && init.body ? String(init.body) : '';
        const { code, label, sort_order } = bodyText ? JSON.parse(bodyText) : {};
        if (!code || !label) {
          return jsonResponse({ success: false, message: 'Validation failed.', errors: { code: ['Code is required'], label: ['Label is required'] } }, 400);
        }
        if ((mock as any).milestone_statuses.find((s: any) => s.code === code)) {
          return jsonResponse({ success: false, message: 'Validation failed.', errors: { code: ['This code is already registered.'] } }, 400);
        }
        const newStatus = { id: nextId((mock as any).milestone_statuses), code, label, sort_order: Number(sort_order) || 0, is_system: false };
        (mock as any).milestone_statuses.push(newStatus);
        return jsonResponse({ success: true, message: 'Created.', data: newStatus });
      }
    }

    // Milestone Statuses PATCH & DELETE
    if (url.pathname.startsWith('/api/v1/milestone-statuses/')) {
      const id = Number(url.pathname.split('/').pop());
      const idx = (mock as any).milestone_statuses.findIndex((s: any) => s.id === id);
      if (idx !== -1) {
        if (method === 'PATCH' || method === 'PUT') {
          const bodyText = init && init.body ? String(init.body) : '';
          const { code, label, sort_order } = bodyText ? JSON.parse(bodyText) : {};
          const statusItem = (mock as any).milestone_statuses[idx];
          statusItem.code = code || statusItem.code;
          statusItem.label = label || statusItem.label;
          statusItem.sort_order = Number(sort_order) || statusItem.sort_order;
          return jsonResponse({ success: true, message: 'Updated.', data: statusItem });
        }
        if (method === 'DELETE') {
          if ((mock as any).milestone_statuses[idx].is_system) {
            return jsonResponse({ success: false, message: 'Cannot delete system record.' }, 403);
          }
          (mock as any).milestone_statuses.splice(idx, 1);
          return jsonResponse({ success: true, message: 'Deleted successfully.' });
        }
      } else {
        return jsonResponse({ success: false, message: 'Milestone status not found.' }, 404);
      }
    }

    // Project Types GET & POST
    if (url.pathname === '/api/v1/project-types') {
      if (method === 'GET') {
        return jsonResponse({ success: true, message: 'OK', data: getSnapshot().project_types });
      }
      if (method === 'POST') {
        const bodyText = init && init.body ? String(init.body) : '';
        const { code, label, sort_order } = bodyText ? JSON.parse(bodyText) : {};
        if (!code || !label) {
          return jsonResponse({ success: false, message: 'Validation failed.', errors: { code: ['Code is required'], label: ['Label is required'] } }, 400);
        }
        if ((mock as any).project_types.find((s: any) => s.code === code)) {
          return jsonResponse({ success: false, message: 'Validation failed.', errors: { code: ['This code is already registered.'] } }, 400);
        }
        const newType = { id: nextId((mock as any).project_types), code, label, sort_order: Number(sort_order) || 0, is_system: false };
        (mock as any).project_types.push(newType);
        return jsonResponse({ success: true, message: 'Created.', data: newType });
      }
    }

    // Project Types PATCH & DELETE
    if (url.pathname.startsWith('/api/v1/project-types/')) {
      const id = Number(url.pathname.split('/').pop());
      const idx = (mock as any).project_types.findIndex((t: any) => t.id === id);
      if (idx !== -1) {
        if (method === 'PATCH' || method === 'PUT') {
          const bodyText = init && init.body ? String(init.body) : '';
          const { code, label, sort_order } = bodyText ? JSON.parse(bodyText) : {};
          const typeItem = (mock as any).project_types[idx];
          typeItem.code = code || typeItem.code;
          typeItem.label = label || typeItem.label;
          typeItem.sort_order = Number(sort_order) || typeItem.sort_order;
          return jsonResponse({ success: true, message: 'Updated.', data: typeItem });
        }
        if (method === 'DELETE') {
          if ((mock as any).project_types[idx].is_system) {
            return jsonResponse({ success: false, message: 'Cannot delete system record.' }, 403);
          }
          (mock as any).project_types.splice(idx, 1);
          return jsonResponse({ success: true, message: 'Deleted successfully.' });
        }
      } else {
        return jsonResponse({ success: false, message: 'Project type not found.' }, 404);
      }
    }

    // Milestone Phases GET & POST
    if (url.pathname === '/api/v1/milestone-phases') {
      if (method === 'GET') {
        return jsonResponse({ success: true, message: 'OK', data: getSnapshot().milestone_phases });
      }
      if (method === 'POST') {
        const bodyText = init && init.body ? String(init.body) : '';
        const { code, label, sort_order } = bodyText ? JSON.parse(bodyText) : {};
        if (!code || !label) {
          return jsonResponse({ success: false, message: 'Validation failed.', errors: { code: ['Code is required'], label: ['Label is required'] } }, 400);
        }
        if ((mock as any).milestone_phases.find((s: any) => s.code === code)) {
          return jsonResponse({ success: false, message: 'Validation failed.', errors: { code: ['This code is already registered.'] } }, 400);
        }
        const newPhase = { id: nextId((mock as any).milestone_phases), code, label, sort_order: Number(sort_order) || 0, is_system: false };
        (mock as any).milestone_phases.push(newPhase);
        return jsonResponse({ success: true, message: 'Created.', data: newPhase });
      }
    }

    // Milestone Phases PATCH & DELETE
    if (url.pathname.startsWith('/api/v1/milestone-phases/')) {
      const id = Number(url.pathname.split('/').pop());
      const idx = (mock as any).milestone_phases.findIndex((p: any) => p.id === id);
      if (idx !== -1) {
        if (method === 'PATCH' || method === 'PUT') {
          const bodyText = init && init.body ? String(init.body) : '';
          const { code, label, sort_order } = bodyText ? JSON.parse(bodyText) : {};
          const phaseItem = (mock as any).milestone_phases[idx];
          phaseItem.code = code || phaseItem.code;
          phaseItem.label = label || phaseItem.label;
          phaseItem.sort_order = Number(sort_order) || phaseItem.sort_order;
          return jsonResponse({ success: true, message: 'Updated.', data: phaseItem });
        }
        if (method === 'DELETE') {
          if ((mock as any).milestone_phases[idx].is_system) {
            return jsonResponse({ success: false, message: 'Cannot delete system record.' }, 403);
          }
          (mock as any).milestone_phases.splice(idx, 1);
          return jsonResponse({ success: true, message: 'Deleted successfully.' });
        }
      } else {
        return jsonResponse({ success: false, message: 'Milestone phase not found.' }, 404);
      }
    }

    // Clients GET & POST
    if (url.pathname === '/api/v1/clients') {
      if (method === 'GET') {
        const clientsList = getSnapshot().clients;
        return jsonResponse({
          success: true,
          message: 'OK',
          data: {
            items: clientsList,
            pagination: {
              current_page: 1,
              per_page: 15,
              total: clientsList.length,
              last_page: 1
            }
          }
        });
      }
      if (method === 'POST') {
        const bodyText = init && init.body ? String(init.body) : '';
        const { name, contact_name, email, phone } = bodyText ? JSON.parse(bodyText) : {};
        if (!name) {
          return jsonResponse({ success: false, message: 'Validation failed.', errors: { name: ['Name is required'] } }, 400);
        }
        const newClient = {
          id: nextId((mock as any).clients),
          name,
          contact_name: contact_name || '',
          email: email || '',
          phone: phone || '',
          created_at: new Date().toISOString()
        };
        (mock as any).clients.push(newClient);
        return jsonResponse({ success: true, message: 'Created.', data: newClient });
      }
    }

    // Clients PATCH & DELETE
    if (url.pathname.startsWith('/api/v1/clients/')) {
      const id = Number(url.pathname.split('/').pop());
      const idx = (mock as any).clients.findIndex((c: any) => c.id === id);
      if (idx !== -1) {
        if (method === 'PATCH' || method === 'PUT') {
          const bodyText = init && init.body ? String(init.body) : '';
          const { name, contact_name, email, phone } = bodyText ? JSON.parse(bodyText) : {};
          const clientItem = (mock as any).clients[idx];
          if (name !== undefined) clientItem.name = name;
          if (contact_name !== undefined) clientItem.contact_name = contact_name;
          if (email !== undefined) clientItem.email = email;
          if (phone !== undefined) clientItem.phone = phone;
          return jsonResponse({ success: true, message: 'Updated.', data: clientItem });
        }
        if (method === 'DELETE') {
          if ((mock as any).clients[idx].is_system) {
            return jsonResponse({ success: false, message: 'Cannot delete system record.' }, 403);
          }
          (mock as any).clients.splice(idx, 1);
          return jsonResponse({ success: true, message: 'Deleted successfully.' });
        }
      } else {
        return jsonResponse({ success: false, message: 'Client not found.' }, 404);
      }
    }

    // Fallback: return snapshot for unknown GET API requests
    if (method === 'GET') {
      const snap = getSnapshot();
      // Try to map /api/<name> -> snap[name]
      const parts = url.pathname.replace(/^\/api\//, '').split('/');
      const key = parts[0];
      if (key && (snap as any)[key]) return jsonResponse((snap as any)[key]);
    }

    // For unhandled requests, fallback to real fetch to allow proxy/real backend requests to proceed
    return originalFetch(input, init);
  } catch (err) {
    return originalFetch(input, init);
  }
};

console.info('Client mock server initialized: /api/* requests are handled in-memory');
