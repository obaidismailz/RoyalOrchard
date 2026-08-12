/**
 * Service to handle API calls for Milestone operations under a project.
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

export interface MilestonePayload {
  code: string;
  name: string;
  description: string;
  phase_id: number;
  status_id: number;
  sequence: number;
  planned_date: string;
  actual_date: string;
  predecessor_id: number | null | string;
  responsible_user_id: number;
  responsible_party_label: string;
  deliverable: string;
  is_payment_milestone: number; // 1 for true, 0 for false
  payment_amount: number | string;
}

export const milestoneService = {
  /**
   * Get all milestones for a specific project
   */
  getMilestones: async (projectId: number | string) => {
    const res = await fetch(`${getBaseUrl()}v1/projects/${projectId}/milestones`, {
      method: 'GET',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error(`Fetch milestones failed: ${res.status} ${res.statusText}`);
    return res.json();
  },

  /**
   * Create a new milestone for a project
   */
  createMilestone: async (projectId: number | string, payload: MilestonePayload) => {
    const res = await fetch(`${getBaseUrl()}v1/projects/${projectId}/milestones`, {
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
      throw new Error(`Create milestone failed: ${res.status} ${res.statusText}`);
    }
    return resData;
  },

  /**
   * Update an existing milestone
   */
  updateMilestone: async (projectId: number | string, milestoneId: number | string, payload: MilestonePayload) => {
    const res = await fetch(`${getBaseUrl()}v1/projects/${projectId}/milestones/${milestoneId}`, {
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
      throw new Error(`Update milestone failed: ${res.status} ${res.statusText}`);
    }
    return resData;
  },

  /**
   * Delete a milestone from a project
   */
  deleteMilestone: async (projectId: number | string, milestoneId: number | string) => {
    const res = await fetch(`${getBaseUrl()}v1/projects/${projectId}/milestones/${milestoneId}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error(`Delete milestone failed: ${res.status} ${res.statusText}`);
    return res.json();
  }
};
