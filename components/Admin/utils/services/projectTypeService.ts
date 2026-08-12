/**
 * Service to handle API calls for Project Type configuration.
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

export interface ProjectTypePayload {
  code: string;
  label: string;
  sort_order: number;
}

export const projectTypeService = {
  /**
   * Get list of all project types
   */
  getProjectTypes: async () => {
    const res = await fetch(`${getBaseUrl()}v1/project-types`, {
      method: 'GET',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error(`Fetch project types failed: ${res.status} ${res.statusText}`);
    return res.json();
  },

  /**
   * Create a new project type
   */
  createProjectType: async (payload: ProjectTypePayload) => {
    const res = await fetch(`${getBaseUrl()}v1/project-types`, {
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
      throw new Error(`Create project type failed: ${res.status} ${res.statusText}`);
    }
    return resData;
  },

  /**
   * Update an existing project type
   */
  updateProjectType: async (id: number | string, payload: ProjectTypePayload) => {
    const res = await fetch(`${getBaseUrl()}v1/project-types/${id}`, {
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
      throw new Error(`Update project type failed: ${res.status} ${res.statusText}`);
    }
    return resData;
  },

  /**
   * Delete a project type
   */
  deleteProjectType: async (id: number | string) => {
    const res = await fetch(`${getBaseUrl()}v1/project-types/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error(`Delete project type failed: ${res.status} ${res.statusText}`);
    return res.json();
  }
};
