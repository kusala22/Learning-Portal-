import api from './api';

export const bookmarkService = {
  getBookmarks: (videoId) => api.get(`/bookmarks/${videoId}`),
  getAllBookmarks: () => api.get('/bookmarks'),
  createBookmark: (data) => api.post('/bookmarks', data),
  updateBookmark: (id, data) => api.put(`/bookmarks/${id}`, data),
  deleteBookmark: (id) => api.delete(`/bookmarks/${id}`),
};
