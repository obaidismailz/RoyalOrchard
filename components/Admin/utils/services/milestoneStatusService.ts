/**
 * Service to handle API calls for Milestone Status configuration.
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

export interface MilestoneStatusPayload {
  code: string;
  label: string;
  sort_order: number;
}

export const milestoneStatusService = {
  /**
   * Get list of all milestone statuses
   */
  getMilestoneStatuses: async () => {
    const res = await fetch(`${getBaseUrl()}v1/milestone-statuses`, {
      method: 'GET',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error(`Fetch milestone statuses failed: ${res.status} ${res.statusText}`);
    return res.json();
  },

  /**
   * Create a new milestone status options
   */
  createMilestoneStatus: async (payload: MilestoneStatusPayload) => {
    const res = await fetch(`${getBaseUrl()}v1/milestone-statuses`, {
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
      throw new Error(`Create milestone status failed: ${res.status} ${res.statusText}`);
    }
    return resData;
  },

  /**
   * Update an existing milestone status option
   */
  updateMilestoneStatus: async (id: number | string, payload: MilestoneStatusPayload) => {
    const res = await fetch(`${getBaseUrl()}v1/milestone-statuses/${id}`, {
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
      throw new Error(`Update milestone status failed: ${res.status} ${res.statusText}`);
    }
    return resData;
  },

  /**
   * Delete a milestone status option
   */
  deleteMilestoneStatus: async (id: number | string) => {
    const res = await fetch(`${getBaseUrl()}v1/milestone-statuses/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error(`Delete milestone status failed: ${res.status} ${res.statusText}`);
    return res.json();
  }
};
