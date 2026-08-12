/**
 * Service to handle API calls for Client configuration.
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

export interface ClientPayload {
  name: string;
  contact_name: string;
  email: string;
  phone: string;
  address?: string;
}

export const clientService = {
  /**
   * Get list of all clients
   */
  getClients: async () => {
    const res = await fetch(`${getBaseUrl()}v1/clients`, {
      method: 'GET',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error(`Fetch clients failed: ${res.status} ${res.statusText}`);
    return res.json();
  },

  /**
   * Get details for a single client
   */
  getClientDetails: async (id: number | string) => {
    const res = await fetch(`${getBaseUrl()}v1/clients/${id}`, {
      method: 'GET',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error(`Fetch client details failed: ${res.status} ${res.statusText}`);
    return res.json();
  },

  /**
   * Create a new client
   */
  createClient: async (payload: ClientPayload) => {
    const res = await fetch(`${getBaseUrl()}v1/clients`, {
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
      throw new Error(`Create client failed: ${res.status} ${res.statusText}`);
    }
    return resData;
  },

  /**
   * Update an existing client
   */
  updateClient: async (id: number | string, payload: ClientPayload) => {
    const res = await fetch(`${getBaseUrl()}v1/clients/${id}`, {
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
      throw new Error(`Update client failed: ${res.status} ${res.statusText}`);
    }
    return resData;
  },

  /**
   * Delete a client
   */
  deleteClient: async (id: number | string) => {
    const res = await fetch(`${getBaseUrl()}v1/clients/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error(`Delete client failed: ${res.status} ${res.statusText}`);
    return res.json();
  }
};
