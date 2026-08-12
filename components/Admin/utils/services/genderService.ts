/**
 * Service to handle API calls for Gender configuration.
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

export interface GenderPayload {
  code: string;
  label: string;
  sort_order: number;
}

export const genderService = {
  /**
   * Get list of all genders
   */
  getGenders: async () => {
    const res = await fetch(`${getBaseUrl()}v1/genders`, {
      method: 'GET',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error(`Fetch genders failed: ${res.status} ${res.statusText}`);
    return res.json();
  },

  /**
   * Create a new gender options
   */
  createGender: async (payload: GenderPayload) => {
    const res = await fetch(`${getBaseUrl()}v1/genders`, {
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
      throw new Error(`Create gender failed: ${res.status} ${res.statusText}`);
    }
    return resData;
  },

  /**
   * Update an existing gender option
   */
  updateGender: async (id: number | string, payload: GenderPayload) => {
    const res = await fetch(`${getBaseUrl()}v1/genders/${id}`, {
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
      throw new Error(`Update gender failed: ${res.status} ${res.statusText}`);
    }
    return resData;
  },

  /**
   * Delete a gender option
   */
  deleteGender: async (id: number | string) => {
    const res = await fetch(`${getBaseUrl()}v1/genders/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error(`Delete gender failed: ${res.status} ${res.statusText}`);
    return res.json();
  }
};
