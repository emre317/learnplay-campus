import axios from 'axios';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api', withCredentials: true });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('lpc-token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const errMsg = (e) => e?.response?.data?.message || 'Bir şeyler ters gitti.';
export default api;
