import api from './api';

export const progressService = {
  saveProgress: (data) => api.post('/progress', data),
  getProgress: (videoId) => api.get(`/progress/${videoId}`),
  getAllProgress: () => api.get('/progress'),
};
