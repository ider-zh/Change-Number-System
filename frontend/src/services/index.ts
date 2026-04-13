import api from './api';
import axios from 'axios';

export interface Project {
  id: number;
  code: string;
  name: string;
  status: string;
  created_by?: string;
  created_at: string;
  approved_at?: string;
  project_code?: string;
  project_name?: string;
  user_id?: string;
}

export interface NumberType {
  id: number;
  type_code: string;
  type_name: string;
  description: string;
  status: string;
  created_by?: string;
  created_at: string;
  approved_at?: string;
  user_id?: string;
}

export interface Application {
  id: number;
  applicant_name: string;
  applicant_type?: string;
  project_code: string;
  number_type: string;
  serial_number: number;
  full_number: string;
  ip_address?: string;
  created_at: string;
}

export const projectAPI = {
  getAll: (status?: string) => {
    const params = status ? { status } : undefined;
    return api.get('/projects', { params });
  },
  getPending: () => api.get('/projects/requests'),
  create: (data: { code: string; name: string }) => api.post('/projects', data),
  update: (id: number, data: Partial<Project>) => api.put(`/projects/${id}`, data),
  delete: (id: number) => api.delete(`/projects/${id}`),
  request: (data: { project_code: string; project_name: string; applicant_name: string }) =>
    api.post('/projects/request', data),
  review: (id: number, data: { status: string; reviewer_note?: string }) =>
    api.put(`/projects/${id}/review`, data),
};

export const numberTypeAPI = {
  getAll: (status?: string) => {
    const params = status ? { status } : undefined;
    return api.get('/number-types', { params });
  },
  getPending: () => api.get('/number-types/requests'),
  create: (data: { type_code: string; type_name: string; description?: string }) =>
    api.post('/number-types', data),
  update: (id: number, data: Partial<NumberType>) => api.put(`/number-types/${id}`, data),
  delete: (id: number) => api.delete(`/number-types/${id}`),
  request: (data: { type_code: string; type_name: string; description?: string; applicant_name: string }) =>
    api.post('/number-types/request', data),
  review: (id: number, data: { status: string; reviewer_note?: string }) =>
    api.put(`/number-types/${id}/review`, data),
};

export const applicationAPI = {
  create: (data: { applicant_name: string; project_code: string; number_type: string }) =>
    api.post('/applications', data),
  getAll: (params: { page?: number; limit?: number; keyword?: string; project_code?: string; number_type?: string; start_date?: string; end_date?: string; applicant_name?: string; ip_address?: string }) => api.get('/applications', { params }),
  getStats: () => api.get('/applications/stats'),
  delete: (id: number) => api.delete(`/applications/${id}`),
  batchDelete: (ids: number[]) => api.delete('/applications', { data: { ids } }),
  exportCSV: async () => {
    // 使用原始axios实例，绕过响应拦截器
    const token = localStorage.getItem('adminToken');
    const response = await axios.get('/api/applications/export', {
      responseType: 'blob',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });

    const blob = new Blob([response.data]);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const date = new Date().toISOString().split('T')[0];
    link.setAttribute('download', `applications_${date}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};

export const adminAPI = {
  login: (data: { username: string; password: string }) => api.post('/admin/login', data),
  logout: () => api.post('/admin/logout'),
  changePassword: (data: { currentPassword: string; newPassword: string }) => api.post('/admin/change-password', data),
  deleteApplication: (id: number) => api.delete(`/admin/applications/${id}`),
};

export const settingsAPI = {
  getFeatureToggles: () => api.get('/settings/feature-toggles'),
  updateFeatureToggles: (data: { allow_request_project?: boolean; allow_request_number_type?: boolean }) =>
    api.put('/settings/feature-toggles', data),
  getCooldown: () => api.get('/settings/cooldown'),
  updateCooldown: (data: { cooldown_seconds: number }) =>
    api.put('/settings/cooldown', data),
};
