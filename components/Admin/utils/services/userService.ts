/**
 * Service to handle API calls for User/Staff Management operations.
 */

const getHeaders = (isMultipart = false) => {
  const token = localStorage.getItem('adminToken');
  return {
    ...(!isMultipart ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

const getBaseUrl = () => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api/';
  return baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
};

export interface CreateUserPayload {
  first_name: string;
  last_name: string;
  gender_id: number;
  date_of_birth: string; // format: d-m-yyyy
  email: string;
  user_status_id: number;
  role_ids: number[];
  picture?: File | null;
}

export interface UpdateUserPayload {
  first_name: string;
  last_name: string;
  email: string;
  gender_id: number;
  date_of_birth: string; // format: d-m-yyyy
  user_status_id: number;
  picture?: File | null;
  _method?: 'PATCH';
}

export const userService = {
  /**
   * Get all users (paginated)
   */
  getUsers: async (page = 1) => {
    const res = await fetch(`${getBaseUrl()}v1/users?page=${page}`, {
      method: 'GET',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error(`Fetch users failed: ${res.status} ${res.statusText}`);
    return res.json();
  },

  /**
   * Get details of a single user
   */
  getUserDetails: async (id: number | string) => {
    const res = await fetch(`${getBaseUrl()}v1/users/${id}`, {
      method: 'GET',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error(`Fetch user details failed: ${res.status} ${res.statusText}`);
    return res.json();
  },

  /**
   * Create a new user account (supporting profile pictures via FormData)
   */
  createUser: async (payload: CreateUserPayload) => {
    const formData = new FormData();
    formData.append('first_name', payload.first_name);
    formData.append('last_name', payload.last_name);
    formData.append('gender_id', String(payload.gender_id));
    formData.append('date_of_birth', payload.date_of_birth);
    formData.append('email', payload.email);
    formData.append('user_status_id', String(payload.user_status_id));
    
    if (payload.role_ids && payload.role_ids.length > 0) {
      payload.role_ids.forEach((roleId, idx) => {
        formData.append(`role_ids[${idx}]`, String(roleId));
      });
    }

    if (payload.picture) {
      formData.append('picture', payload.picture);
    }

    const res = await fetch(`${getBaseUrl()}v1/users`, {
      method: 'POST',
      headers: getHeaders(true),
      body: formData
    });
    
    let resData;
    try {
      resData = await res.json();
    } catch (e) {
      // Not JSON
    }

    if (!res.ok) {
      if (resData) {
        return { success: false, ...resData };
      }
      throw new Error(`Create user failed: ${res.status} ${res.statusText}`);
    }
    return resData;
  },

  /**
   * Update an existing user account details (supporting profile pictures via FormData)
   */
  updateUser: async (id: number | string, payload: UpdateUserPayload) => {
    const formData = new FormData();
    formData.append('first_name', payload.first_name);
    formData.append('last_name', payload.last_name);
    formData.append('email', payload.email);
    formData.append('gender_id', String(payload.gender_id));
    formData.append('date_of_birth', payload.date_of_birth);
    formData.append('user_status_id', String(payload.user_status_id));
    formData.append('_method', 'PATCH');

    if (payload.picture) {
      formData.append('picture', payload.picture);
    }

    const res = await fetch(`${getBaseUrl()}v1/users/${id}`, {
      method: 'POST',
      headers: getHeaders(true),
      body: formData
    });
    
    let resData;
    try {
      resData = await res.json();
    } catch (e) {
      // Not JSON
    }

    if (!res.ok) {
      if (resData) {
        return { success: false, ...resData };
      }
      throw new Error(`Update user failed: ${res.status} ${res.statusText}`);
    }
    return resData;
  },

  /**
   * Delete a user account from the system
   */
  deleteUser: async (id: number | string) => {
    const res = await fetch(`${getBaseUrl()}v1/users/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error(`Delete user failed: ${res.status} ${res.statusText}`);
    return res.json();
  },

  /**
   * Assign a role to a user
   */
  assignRole: async (userId: number | string, roleId: number) => {
    const res = await fetch(`${getBaseUrl()}v1/users/${userId}/assign-role`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ role_id: roleId })
    });
    if (!res.ok) throw new Error(`Assign role failed: ${res.status} ${res.statusText}`);
    return res.json();
  },

  /**
   * Revoke a role from a user
   */
  revokeRole: async (userId: number | string, roleId: number | string) => {
    const res = await fetch(`${getBaseUrl()}v1/users/${userId}/roles/${roleId}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error(`Revoke role failed: ${res.status} ${res.statusText}`);
    return res.json();
  }
};
