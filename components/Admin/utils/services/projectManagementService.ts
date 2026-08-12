/**
 * Service to handle API calls for Project Management operations.
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

export interface CreateProjectPayload {
  code: string;
  name: string;
  client_id: number;
  project_type_id: number;
  project_status_id: number;
  site_address: string;
  budget: number;
  start_date: string;
  end_date: string;
}

export const projectManagementService = {
  /**
   * Get paginated list of projects
   */
  getProjects: async (page = 1) => {
    const res = await fetch(`${getBaseUrl()}v1/projects?page=${page}`, {
      method: 'GET',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error(`Fetch projects failed: ${res.status} ${res.statusText}`);
    return res.json();
  },

  /**
   * Create a new project record on the backend
   */
  createProject: async (payload: CreateProjectPayload) => {
    const res = await fetch(`${getBaseUrl()}v1/projects`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(`Create project failed: ${res.status} ${res.statusText}`);
    return res.json();
  },

  /**
   * Get single project details
   */
  getProjectDetails: async (id: number | string) => {
    const res = await fetch(`${getBaseUrl()}v1/projects/${id}`, {
      method: 'GET',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error(`Fetch project details failed: ${res.status} ${res.statusText}`);
    return res.json();
  },

  /**
   * Update a project record
   */
  updateProject: async (id: number | string, payload: CreateProjectPayload) => {
    const res = await fetch(`${getBaseUrl()}v1/projects/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(`Update project failed: ${res.status} ${res.statusText}`);
    return res.json();
  },

  /**
   * Delete a project record
   */
  deleteProject: async (id: number | string) => {
    const res = await fetch(`${getBaseUrl()}v1/projects/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error(`Delete project failed: ${res.status} ${res.statusText}`);
    return res.json();
  },

  /**
   * Get all users assigned to a project
   */
  getProjectUsers: async (id: number | string) => {
    const res = await fetch(`${getBaseUrl()}v1/projects/${id}/users`, {
      method: 'GET',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error(`Fetch project users failed: ${res.status} ${res.statusText}`);
    return res.json();
  },

  /**
   * Remove a user from a project
   */
  /**
   * Remove a user from a project
   */
  removeUserFromProject: async (projectId: number | string, userId: number | string) => {
    const res = await fetch(`${getBaseUrl()}v1/projects/${projectId}/users/${userId}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    const resData = await res.json().catch(() => null);
    if (!res.ok) {
      const errorMsg = resData?.message || `Remove user from project failed: ${res.status} ${res.statusText}`;
      const err: any = new Error(errorMsg);
      err.status = res.status;
      err.response = resData;
      throw err;
    }
    return resData;
  },

  /**
   * Update the status of a project
   */
  updateProjectStatus: async (projectId: number | string, statusId: number) => {
    const res = await fetch(`${getBaseUrl()}v1/projects/${projectId}/status`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ project_status_id: statusId })
    });
    const resData = await res.json().catch(() => null);
    if (!res.ok) {
      const errorMsg = resData?.message || `Update status failed: ${res.status} ${res.statusText}`;
      const err: any = new Error(errorMsg);
      err.status = res.status;
      err.response = resData;
      throw err;
    }
    return resData;
  },

  /**
   * Assign a user/crew member to a project
   */
  assignUserToProject: async (projectId: number | string, userId: number | string) => {
    const res = await fetch(`${getBaseUrl()}v1/projects/${projectId}/assign-user`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ user_id: Number(userId) })
    });
    const resData = await res.json().catch(() => null);
    if (!res.ok) {
      const errorMsg = resData?.message || `Assign user failed: ${res.status} ${res.statusText}`;
      const err: any = new Error(errorMsg);
      err.status = res.status;
      err.response = resData;
      throw err;
    }
    return resData;
  },

  /**
   * Get all project types
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
   * Get all project statuses
   */
  getProjectStatuses: async () => {
    const res = await fetch(`${getBaseUrl()}v1/project-statuses`, {
      method: 'GET',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error(`Fetch project statuses failed: ${res.status} ${res.statusText}`);
    return res.json();
  }
};

