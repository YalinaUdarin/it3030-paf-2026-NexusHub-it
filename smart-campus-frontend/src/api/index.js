import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080'

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/landing'
    }
    return Promise.reject(error)
  }
)

// ── Auth ──────────────────────────────────────────────
export const authApi = {
  getMe: () => api.get('/api/auth/me'),
  getGoogleLoginUrl: () => `${API_BASE}/api/auth/oauth2/authorize/google`,
  login: (email, password) => api.post('/api/auth/login', { email, password }),
  register: (name, email, password) => api.post('/api/auth/register', { name, email, password }),
}

// ── Resources ─────────────────────────────────────────
export const resourceApi = {
  getAll: (params) => api.get('/api/resources', { params }),
  getById: (id) => api.get(`/api/resources/${id}`),
  create: (data) => api.post('/api/resources', data),
  update: (id, data) => api.put(`/api/resources/${id}`, data),
  updateStatus: (id, status) => api.patch(`/api/resources/${id}/status`, null, { params: { status } }),
  delete: (id) => api.delete(`/api/resources/${id}`),
}

// ── Bookings ──────────────────────────────────────────
export const bookingApi = {
  getAll: (params) => api.get('/api/bookings', { params }),
  getById: (id) => api.get(`/api/bookings/${id}`),
  create: (data) => api.post('/api/bookings', data),
  approve: (id) => api.patch(`/api/bookings/${id}/approve`),
  reject: (id, reason) => api.patch(`/api/bookings/${id}/reject`, { reason }),
  cancel: (id) => api.patch(`/api/bookings/${id}/cancel`),
}

// ── Tickets ───────────────────────────────────────────
export const ticketApi = {
  getAll: (params) => api.get('/api/tickets', { params }),
  getById: (id) => api.get(`/api/tickets/${id}`),
  create: (formData) => api.post('/api/tickets', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateStatus: (id, data) => api.patch(`/api/tickets/${id}/status`, data),
  assign: (id, technicianId) => api.patch(`/api/tickets/${id}/assign`, { technicianId }),
  addComment: (id, content) => api.post(`/api/tickets/${id}/comments`, { content }),
  editComment: (ticketId, commentId, content) =>
    api.put(`/api/tickets/${ticketId}/comments/${commentId}`, { content }),
  deleteComment: (ticketId, commentId) =>
    api.delete(`/api/tickets/${ticketId}/comments/${commentId}`),
}

// ── Notifications ─────────────────────────────────────
export const notificationApi = {
  getAll: (unreadOnly) => api.get('/api/notifications', { params: { unreadOnly } }),
  getCount: () => api.get('/api/notifications/count'),
  markAsRead: (id) => api.patch(`/api/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/api/notifications/read-all'),
  delete: (id) => api.delete(`/api/notifications/${id}`),
  getPreferences: () => api.get('/api/notifications/preferences'),
  updatePreferences: (prefs) => api.put('/api/notifications/preferences', prefs),
}

// ── Admin ─────────────────────────────────────────────
export const adminApi = {
  getUsers: () => api.get('/api/admin/users'),
  updateRoles: (id, roles) => api.patch(`/api/admin/users/${id}/roles`, { roles }),
  toggleUser: (id, enabled) => api.patch(`/api/admin/users/${id}/toggle`, { enabled }),
  getStats: () => api.get('/api/admin/stats'),
}

export default api
