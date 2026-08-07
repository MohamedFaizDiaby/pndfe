import axios from 'axios';

declare const __API_URL__: string;

export const API_URL = typeof __API_URL__ !== 'undefined' ? __API_URL__ : 'http://localhost:4190';

export const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('pndfe_token');
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export function fileUrl(path?: string | null): string | undefined {
  if (!path) return undefined;
  return `${API_URL}${path}`;
}
