import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: '/api', // Vite proxy will forward to http://localhost:3000/api
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;

      if (status === 401) {
        // Unauthorized - clear token and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }

      // Return error message from server
      return Promise.reject(data || error);
    } else if (error.request) {
      // Request made but no response
      return Promise.reject({
        success: false,
        message: 'Server không phản hồi. Vui lòng kiểm tra kết nối.',
      });
    } else {
      // Error in request setup
      return Promise.reject({
        success: false,
        message: error.message || 'Đã xảy ra lỗi',
      });
    }
  }
);

// ============================================
// AUTH API
// ============================================

export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
};

// ============================================
// QUESTIONS API
// ============================================

export const questionsAPI = {
  // Get questions for game (public or filtered by tags)
  getQuestions: (params) => api.get('/questions', { params }),

  // Get single question
  getQuestion: (id) => api.get(`/questions/${id}`),
};

// ============================================
// GAME API
// ============================================

export const gameAPI = {
  // Submit answer
  submitResult: (data) => api.post('/game/submit_result', data),

  // Get user results/history
  getResults: (params) => api.get('/game/results', { params }),

  // Get user stats
  getStats: () => api.get('/game/stats'),
};

// ============================================
// ADMIN API
// ============================================

export const adminAPI = {
  // Question management
  createQuestion: (questionData) => api.post('/admin/questions', questionData),
  getQuestions: (params) => api.get('/admin/questions', { params }),
  updateQuestion: (id, questionData) => api.put(`/admin/questions/${id}`, questionData),
  deleteQuestion: (id) => api.delete(`/admin/questions/${id}`),
};

// ============================================
// SHOP API
// ============================================

export const shopAPI = {
  getItems: () => api.get('/shop/items'),
  purchase: (itemId, quantity) => api.post('/shop/purchase', { itemId, quantity }),
  getUserPurchases: () => api.get('/shop/purchases'),
};

// Export default axios instance for custom requests
export default api;
