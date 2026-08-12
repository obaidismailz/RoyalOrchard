/**
 * Service to handle API calls for Roles and Permissions management.
 */

const getHeaders = () => {
  const token = localStorage.getItem('adminToken');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

const getBaseUrl = () => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api/';
  return baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
};

export const rolesPermissionsService = {
  /**
   * List all roles and permissions
   */
  getRolesAndPermissions: async () => {
    const res = await fetch(`${getBaseUrl()}v1/auth/roles-permissions`, {
      method: 'GET',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error(`Fetch roles-permissions failed: ${res.statusText}`);
    return res.json();
  },

  /**
   * Create a new permission
   */
  createPermission: async (name: string) => {
    const res = await fetch(`${getBaseUrl()}v1/permissions`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ name })
    });
    if (!res.ok) throw new Error(`Create permission failed: ${res.statusText}`);
    return res.json();
  },

  /**
   * Create a new role with a list of permission names
   */
  createRole: async (name: string, permissions: string[]) => {
    const res = await fetch(`${getBaseUrl()}v1/roles`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ name, permissions })
    });
    if (!res.ok) throw new Error(`Create role failed: ${res.statusText}`);
    return res.json();
  },

  /**
   * Update permissions for a specific role
   */
  updateRolePermissions: async (roleId: number, permissions: string[]) => {
    const res = await fetch(`${getBaseUrl()}v1/roles/${roleId}/permissions`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ permissions })
    });
    if (!res.ok) throw new Error(`Update role permissions failed: ${res.statusText}`);
    return res.json();
  }
};
