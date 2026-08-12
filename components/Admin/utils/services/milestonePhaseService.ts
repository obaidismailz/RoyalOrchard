/**
 * Service to handle API calls for Milestone Phase configuration.
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

export interface MilestonePhasePayload {
  code: string;
  label: string;
  sort_order: number;
}

export const milestonePhaseService = {
  /**
   * Get list of all milestone phases
   */
  getMilestonePhases: async () => {
    const res = await fetch(`${getBaseUrl()}v1/milestone-phases`, {
      method: 'GET',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error(`Fetch milestone phases failed: ${res.status} ${res.statusText}`);
    return res.json();
  },

  /**
   * Create a new milestone phase
   */
  createMilestonePhase: async (payload: MilestonePhasePayload) => {
    const res = await fetch(`${getBaseUrl()}v1/milestone-phases`, {
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
      throw new Error(`Create milestone phase failed: ${res.status} ${res.statusText}`);
    }
    return resData;
  },

  /**
   * Update an existing milestone phase
   */
  updateMilestonePhase: async (id: number | string, payload: MilestonePhasePayload) => {
    const res = await fetch(`${getBaseUrl()}v1/milestone-phases/${id}`, {
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
      throw new Error(`Update milestone phase failed: ${res.status} ${res.statusText}`);
    }
    return resData;
  },

  /**
   * Delete a milestone phase
   */
  deleteMilestonePhase: async (id: number | string) => {
    const res = await fetch(`${getBaseUrl()}v1/milestone-phases/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error(`Delete milestone phase failed: ${res.status} ${res.statusText}`);
    return res.json();
  }
};
