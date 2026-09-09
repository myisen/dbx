import axios from 'axios'
import { showToast } from 'vant'

const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  response => response.data,
  error => {
    const msg = error.response?.data?.message || '网络错误'
    showToast(msg)
    return Promise.reject(error)
  }
)

export default api

// Auth
export const auth = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data)
}

// Articles
export const articles = {
  list: (params) => api.get('/articles', { params }),
  detail: (id) => api.get(`/articles/${id}`),
  getDaily: () => api.get('/articles/daily/today')
}

// Checkins
export const checkins = {
  create: (data) => api.post('/checkins', data),
  list: (params) => api.get('/checkins', { params }),
  today: () => api.get('/checkins/today'),
  streak: () => api.get('/checkins/streak'),
  calendar: (params) => api.get('/checkins/calendar', { params })
}

// Leaderboard
export const leaderboard = {
  get: (params) => api.get('/leaderboard', { params })
}

// AI
export const ai = {
  generatePlan: (data) => api.post('/ai/plan', data),
  getPlan: () => api.get('/ai/plan'),
  getStatus: () => api.get('/ai/status'),
  getSuggestion: () => api.get('/ai/suggestion')
}