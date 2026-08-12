/**
 * Service to handle API calls for User Status configuration.
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

export interface UserStatusPayload {
  code: string;
  label: string;
  sort_order: number;
}

export const userStatusService = {
  /**
   * Get list of all user statuses
   */
  getUserStatuses: async () => {
    const res = await fetch(`${getBaseUrl()}v1/user-statuses`, {
      method: 'GET',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error(`Fetch user statuses failed: ${res.status} ${res.statusText}`);
    return res.json();
  },

  /**
   * Create a new user status options
   */
  createUserStatus: async (payload: UserStatusPayload) => {
    const res = await fetch(`${getBaseUrl()}v1/user-statuses`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    
    let resData;
    try {
      resData = await res.json();
    } catch (e) {}

    if (!res.ok) {
      if (resData) return { success: false, ...resData };
      throw new Error(`Create user status failed: ${res.status} ${res.statusText}`);
    }
    return resData;
  },

  /**
   * Update an existing user status option
   */
  updateUserStatus: async (id: number | string, payload: UserStatusPayload) => {
    const res = await fetch(`${getBaseUrl()}v1/user-statuses/${id}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });

    let resData;
    try {
      resData = await res.json();
    } catch (e) {}

    if (!res.ok) {
      if (resData) return { success: false, ...resData };
      throw new Error(`Update user status failed: ${res.status} ${res.statusText}`);
    }
    return resData;
  },

  /**
   * Delete a user status option
   */
  deleteUserStatus: async (id: number | string) => {
    const res = await fetch(`${getBaseUrl()}v1/user-statuses/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error(`Delete user status failed: ${res.status} ${res.statusText}`);
    return res.json();
  }
};
