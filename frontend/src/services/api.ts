import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_URL,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  register: (data: { email: string; password: string; name?: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

// Content API
export const contentAPI = {
  getAll: () => api.get('/content'),
  getOne: (id: string) => api.get(`/content/${id}`),
  upload: (formData: FormData) => api.post('/content', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  update: (id: string, data: any) => api.put(`/content/${id}`, data),
  delete: (id: string) => api.delete(`/content/${id}`),
};

// Playlist API
export const playlistAPI = {
  getAll: () => api.get('/playlists'),
  getOne: (id: string) => api.get(`/playlists/${id}`),
  create: (data: { name: string }) => api.post('/playlists', data),
  update: (id: string, data: any) => api.put(`/playlists/${id}`, data),
  delete: (id: string) => api.delete(`/playlists/${id}`),
  addContent: (id: string, contentId: string) =>
    api.post(`/playlists/${id}/content`, { contentId }),
  removeContent: (id: string, contentId: string) =>
    api.delete(`/playlists/${id}/content/${contentId}`),
};

// Player API
export const playerAPI = {
  getAll: () => api.get('/players'),
  getOne: (id: string) => api.get(`/players/${id}`),
  create: (data: { name: string; description?: string }) => api.post('/players', data),
  update: (id: string, data: any) => api.put(`/players/${id}`, data),
  delete: (id: string) => api.delete(`/players/${id}`),
  updateStatus: (id: string, status: string) =>
    api.post(`/players/${id}/status`, { status }),
  uploadScreenshot: (id: string, formData: FormData) =>
    api.post(`/players/${id}/screenshot`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

export default api;
