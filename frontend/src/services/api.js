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
  getMyAdvisor: () => api.get('/customer/my-advisor/'),
}

export const customerService = {
  getMyAdvisor: () => api.get('/customer/my-advisor/'),
  getAvailableAdvisors: () => api.get('/customer/available-advisors/'),
  submitAdvisorRequest: (data) => api.post('/customer/advisor-requests/', data),
  cancelAdvisorRequest: (id) => api.post(`/customer/advisor-requests/${id}/cancel/`),
}

export const advisorService = {
  getCustomerRequests: (params) => api.get('/advisor/customer-requests/', { params }),
  acceptCustomerRequest: (id) => api.post(`/advisor/customer-requests/${id}/accept/`),
  rejectCustomerRequest: (id, data) => api.post(`/advisor/customer-requests/${id}/reject/`, data || {}),
  getAssignedClients: () => api.get('/advisor/assigned-clients/'),
}

export const adminService = {
  getStats: () => api.get('/admin/stats/'),
  getUsers: () => api.get('/users/'),
  createUser: (data) => api.post('/users/', data),
  updateUser: (id, data) => api.patch(`/users/${id}/`, data),
  deleteUser: (id) => api.delete(`/users/${id}/`),
  getAuditLogs: (params) => api.get('/audit/', { params }),
  
  // Advisor Management
  getAdvisors: () => api.get('/admin/advisors/'),
  getAdvisorDetail: (id) => api.get(`/admin/advisors/${id}/`),
  updateAdvisor: (id, data) => api.patch(`/admin/advisors/${id}/`, data),
  toggleAdvisorStatus: (id) => api.post(`/admin/advisors/${id}/toggle-status/`),
  
  // Customer Management
  getCustomers: () => api.get('/admin/customers/'),
  getCustomerDetail: (id) => api.get(`/admin/customers/${id}/`),
  updateCustomer: (id, data) => api.patch(`/admin/customers/${id}/`, data),
  toggleCustomerStatus: (id) => api.post(`/admin/customers/${id}/toggle-status/`),
  assignCustomerAdvisor: (id, data) => api.post(`/admin/customers/${id}/assign-advisor/`, data),
  
  // Security & Access Control
  getSecurityOverview: () => api.get('/admin/security/'),
  
  // System Settings
  getSystemSettings: () => api.get('/admin/settings/'),
  updateSystemSettings: (data) => api.patch('/admin/settings/', data),
}

export const accountService = {
  getAccounts: (params) => api.get('/accounts/', { params }),
  getAccount: (id) => api.get(`/accounts/${id}/`),
  createAccount: (data) => api.post('/accounts/', data),
  updateAccount: (id, data) => api.patch(`/accounts/${id}/`, data),
  deleteAccount: (id) => api.delete(`/accounts/${id}/`),
  transfer: (data) => api.post('/accounts/transfer/', data),
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
  contribute: (id, data) => api.post(`/goals/${id}/contribute/`, data),
}

export const notificationService = {
  getNotifications: () => api.get('/notifications/'),
  markAsRead: (id) => api.patch(`/notifications/${id}/read/`),
  markAllAsRead: () => api.post('/notifications/read-all/'),
  deleteNotification: (id) => api.delete(`/notifications/${id}/`),
  sendAdvisorRecommendation: (data) => api.post('/notifications/send-advice/', data),
}

export const dashboardService = {
  getDashboardData: (params) => api.get('/dashboard/', { params }),
}

export const analyticsService = {
  getAnalyticsData: (params) => api.get('/analytics/', { params }),
}

export const reportService = {
  getSummary: () => api.get('/reports/summary/'),
  downloadReport: (format, type) => {
    return api.get(`/reports/export/${format}/?type=${type}`, {
      responseType: 'blob',
    })
  },
  getDownloadUrl: (format, type) => {
    const token = localStorage.getItem('access_token') || ''
    return `${API_BASE_URL}/reports/export/${format}/?type=${type}&token=${encodeURIComponent(token)}`
  },
  exportCSVUrl: (type) => `${API_BASE_URL}/reports/export/csv/?type=${type}`,
  exportExcelUrl: (type) => `${API_BASE_URL}/reports/export/excel/?type=${type}`,
  exportPDFUrl: (type) => `${API_BASE_URL}/reports/export/pdf/?type=${type}`,
}

export const auditService = {
  getAuditLogs: (params) => api.get('/audit/', { params }),
}


export const systemService = {
  getConfig: () => api.get('/system/config/'),
}
