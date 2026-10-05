import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request Interceptor: Attach JWT Bearer Access Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response Interceptor: Auto Refresh JWT Access Token if expired (401)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes('/users/login/') &&
      !originalRequest.url.includes('/users/token/refresh/')
    ) {
      originalRequest._retry = true
      try {
        const refreshToken = localStorage.getItem('refresh_token')
        if (refreshToken) {
          const res = await axios.post(`${API_BASE_URL}/users/token/refresh/`, {
            refresh: refreshToken,
          })
          const newAccess = res.data.access
          localStorage.setItem('access_token', newAccess)
          originalRequest.headers.Authorization = `Bearer ${newAccess}`
          return api(originalRequest)
        }
      } catch (refreshErr) {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('user')
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api

// API Services
export const authService = {
  register: (data) => api.post('/users/register/', data),
  login: (data) => api.post('/users/login/', data),
  logout: (data) => api.post('/users/logout/', data),
  getProfile: () => api.get('/users/profile/'),
  updateProfile: (data) => api.patch('/users/profile/', data),
  changePassword: (data) => api.post('/users/change-password/', data),
  forgotPassword: (data) => api.post('/users/forgot-password/', data),
  resetPassword: (data) => api.post('/users/reset-password/', data),
  getUsers: () => api.get('/users/'),
  updateUserRole: (id, role) => api.patch(`/users/${id}/`, { role }),
  deleteUser: (id) => api.delete(`/users/${id}/`),
}

export const accountService = {
  getAccounts: (params) => api.get('/accounts/', { params }),
  getAccount: (id) => api.get(`/accounts/${id}/`),
  createAccount: (data) => api.post('/accounts/', data),
  updateAccount: (id, data) => api.patch(`/accounts/${id}/`, data),
  deleteAccount: (id) => api.delete(`/accounts/${id}/`),
}

export const transactionService = {
  getTransactions: (params) => api.get('/transactions/', { params }),
  getTransaction: (id) => api.get(`/transactions/${id}/`),
  createTransaction: (data) => api.post('/transactions/', data),
  updateTransaction: (id, data) => api.patch(`/transactions/${id}/`, data),
  deleteTransaction: (id) => api.delete(`/transactions/${id}/`),
}

export const budgetService = {
  getBudgets: (params) => api.get('/budgets/', { params }),
  createBudget: (data) => api.post('/budgets/', data),
  updateBudget: (id, data) => api.patch(`/budgets/${id}/`, data),
  deleteBudget: (id) => api.delete(`/budgets/${id}/`),
}

export const investmentService = {
  getInvestments: (params) => api.get('/investments/', { params }),
  getPortfolio: (params) => api.get('/investments/portfolio/', { params }),
  createInvestment: (data) => api.post('/investments/', data),
  updateInvestment: (id, data) => api.patch(`/investments/${id}/`, data),
  deleteInvestment: (id) => api.delete(`/investments/${id}/`),
}

export const goalService = {
  getGoals: (params) => api.get('/goals/', { params }),
  createGoal: (data) => api.post('/goals/', data),
  updateGoal: (id, data) => api.patch(`/goals/${id}/`, data),
  deleteGoal: (id) => api.delete(`/goals/${id}/`),
}

export const notificationService = {
  getNotifications: () => api.get('/notifications/'),
  markAsRead: (id) => api.patch(`/notifications/${id}/read/`),
  markAllAsRead: () => api.post('/notifications/read-all/'),
  deleteNotification: (id) => api.delete(`/notifications/${id}/`),
}

export const dashboardService = {
  getDashboardData: (params) => api.get('/dashboard/', { params }),
}

export const analyticsService = {
  getAnalyticsData: (params) => api.get('/analytics/', { params }),
}

export const reportService = {
  getSummary: () => api.get('/reports/summary/'),
  exportCSVUrl: (type) => `${API_BASE_URL}/reports/export/csv/?type=${type}`,
  exportExcelUrl: (type) => `${API_BASE_URL}/reports/export/excel/?type=${type}`,
  exportPDFUrl: (type) => `${API_BASE_URL}/reports/export/pdf/?type=${type}`,
}

export const auditService = {
  getAuditLogs: () => api.get('/audit/'),
}
