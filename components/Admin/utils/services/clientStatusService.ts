/**
 * Service to handle API calls for Client Status configuration.
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

export interface ClientStatusPayload {
  code: string;
  label: string;
  sort_order: number;
}

export const clientStatusService = {
  /**
   * Get list of all client statuses
   */
  getClientStatuses: async () => {
    const res = await fetch(`${getBaseUrl()}v1/client-statuses`, {
      method: 'GET',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error(`Fetch client statuses failed: ${res.status} ${res.statusText}`);
    return res.json();
  },

  /**
   * Create a new client status options
   */
  createClientStatus: async (payload: ClientStatusPayload) => {
    const res = await fetch(`${getBaseUrl()}v1/client-statuses`, {
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
      throw new Error(`Create client status failed: ${res.status} ${res.statusText}`);
    }
    return resData;
  },

  /**
   * Update an existing client status option
   */
  updateClientStatus: async (id: number | string, payload: ClientStatusPayload) => {
    const res = await fetch(`${getBaseUrl()}v1/client-statuses/${id}`, {
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
      throw new Error(`Update client status failed: ${res.status} ${res.statusText}`);
    }
    return resData;
  },

  /**
   * Delete a client status option
   */
  deleteClientStatus: async (id: number | string) => {
    const res = await fetch(`${getBaseUrl()}v1/client-statuses/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error(`Delete client status failed: ${res.status} ${res.statusText}`);
    return res.json();
  }
};
