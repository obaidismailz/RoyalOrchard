/**
 * Service to handle API calls for Authentication operations.
 */

const getHeaders = (token?: string | null) => {
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

const getBaseUrl = () => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api/';
  return baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
};

export const authService = {
  /**
   * Admin panel login API call
   */
  login: async (email: string, password: string) => {
    const res = await fetch(`${getBaseUrl()}v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return res;
  },

  /**
   * Admin panel logout API call
   */
  logout: async (token?: string | null) => {
    const res = await fetch(`${getBaseUrl()}v1/auth/logout`, {
      method: 'POST',
      headers: getHeaders(token)
    });
    return res;
  }
};
