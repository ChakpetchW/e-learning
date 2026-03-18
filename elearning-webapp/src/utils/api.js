import axios from 'axios';

const API_URL = 'https://e-larning.onrender.com/api';

export const getFullUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('/uploads')) return `https://e-larning.onrender.com${url}`;
  return url;
};

export const DEFAULT_COURSE_IMAGE = 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&q=80';
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add interceptor to inject auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add interceptor to handle token expiry / unauth
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  getCurrentUser: () => api.get('/auth/me')
};

// User Endpoints
export const userAPI = {
  getCourses: () => api.get('/user/courses'),
  getCourseDetails: (id) => api.get(`/user/courses/${id}`),
  enrollCourse: (id) => api.post(`/user/courses/${id}/enroll`),
  updateProgress: (lessonId, progress) => api.put(`/user/lessons/${lessonId}/progress`, { progress }),
  getPoints: () => api.get('/user/points'),
  getRewards: () => api.get('/user/rewards'),
  getCategories: () => api.get('/user/categories'),
  requestRedeem: (rewardId) => api.post(`/user/redeem/${rewardId}`),
  submitQuiz: (lessonId, data) => api.post(`/user/lessons/${lessonId}/quiz`, data)
};

// Admin Endpoints
export const adminAPI = {
  getDashboardStats: () => api.get('/admin/dashboard'),

  getUsers: () => api.get('/admin/users'),
  createUser: (data) => api.post('/admin/users', data),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),

  getCourses: () => api.get('/admin/courses'),
  createCourse: (data) => api.post('/admin/courses', data),
  updateCourse: (id, data) => api.put(`/admin/courses/${id}`, data),
  deleteCourse: (id) => api.delete(`/admin/courses/${id}`),

  getCategories: () => api.get('/admin/categories'),
  createCategory: (data) => api.post('/admin/categories', data),
  updateCategory: (id, data) => api.put(`/admin/categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/admin/categories/${id}`),

  getLessons: (courseId) => api.get(`/admin/courses/${courseId}/lessons`),
  createLesson: (data) => api.post('/admin/lessons', data),
  updateLesson: (id, data) => api.put(`/admin/lessons/${id}`, data),
  deleteLesson: (id) => api.delete(`/admin/lessons/${id}`),

  getRewards: () => api.get('/admin/rewards'),
  createReward: (data) => api.post('/admin/rewards', data),
  updateReward: (id, data) => api.put(`/admin/rewards/${id}`, data),
  deleteReward: (id) => api.delete(`/admin/rewards/${id}`),

  getRedeems: () => api.get('/admin/redeems'),
  updateRedeemStatus: (id, status, adminNote = '') => api.put(`/admin/redeems/${id}/status`, { status, adminNote }),

  getCourseQuizReports: (courseId) => api.get(`/admin/courses/${courseId}/quiz-reports`),

  // File Upload
  uploadFile: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }
};

export default api;
