import axios from 'axios';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const api = axios.create({ baseURL: API_URL });
api.interceptors.request.use(async (config) => {
  const token = await window.Clerk?.session?.getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
export const authApi = { syncUser: (data) => api.post('/auth/sync', data), getMe: () => api.get('/auth/me') };
export const roomsApi = {
  create: (data) => api.post('/rooms', data),
  getOpen: () => api.get('/rooms/open'),
  getById: (id) => api.get(`/rooms/${id}`),
  join: (id) => api.put(`/rooms/${id}/join`),
  getMyRooms: () => api.get('/rooms/user/my-rooms'),
};
export const streamApi = { getToken: () => api.post('/stream/token') };
export const executeApi = { runCode: (data) => api.post('/execute', data) };
export default api;
