/**
 * Service to handle API calls for Project Status configuration.
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

export interface ProjectStatusPayload {
  code: string;
  label: string;
  sort_order: number;
}

export const projectStatusService = {
  /**
   * Get list of all project statuses
   */
  getProjectStatuses: async () => {
    const res = await fetch(`${getBaseUrl()}v1/project-statuses`, {
      method: 'GET',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error(`Fetch project statuses failed: ${res.status} ${res.statusText}`);
    return res.json();
  },

  /**
   * Create a new project status options
   */
  createProjectStatus: async (payload: ProjectStatusPayload) => {
    const res = await fetch(`${getBaseUrl()}v1/project-statuses`, {
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
      throw new Error(`Create project status failed: ${res.status} ${res.statusText}`);
    }
    return resData;
  },

  /**
   * Update an existing project status option
   */
  updateProjectStatus: async (id: number | string, payload: ProjectStatusPayload) => {
    const res = await fetch(`${getBaseUrl()}v1/project-statuses/${id}`, {
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
      throw new Error(`Update project status failed: ${res.status} ${res.statusText}`);
    }
    return resData;
  },

  /**
   * Delete a project status option
   */
  deleteProjectStatus: async (id: number | string) => {
    const res = await fetch(`${getBaseUrl()}v1/project-statuses/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error(`Delete project status failed: ${res.status} ${res.statusText}`);
    return res.json();
  }
};
