import axios from 'axios'

const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || 'https://your-env-id.service.tcloudbase.com/admin',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器 - 添加认证 token
http.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 响应拦截器
http.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const msg = err.response?.data?.message || err.message || '请求失败'
    if (err.response?.status === 401) {
      localStorage.removeItem('admin_token')
      window.location.hash = '#/login'
    }
    return Promise.reject(new Error(msg))
  }
)

// ============ 测评管理 API ============

export const testApi = {
  list: (params?: any) => http.get('/tests', { params }),
  detail: (id: string) => http.get(`/tests/${id}`),
  create: (data: any) => http.post('/tests', data),
  update: (id: string, data: any) => http.put(`/tests/${id}`, data),
  delete: (id: string) => http.delete(`/tests/${id}`)
}

// ============ 题目管理 API ============

export const questionApi = {
  listByTest: (testId: string) => http.get(`/tests/${testId}/questions`),
  create: (data: any) => http.post('/questions', data),
  update: (id: string, data: any) => http.put(`/questions/${id}`, data),
  delete: (id: string) => http.delete(`/questions/${id}`),
  batchImport: (testId: string, questions: any[]) => http.post(`/tests/${testId}/questions/batch`, { questions })
}

// ============ 职业库 API ============

export const careerApi = {
  list: (params?: any) => http.get('/careers', { params }),
  create: (data: any) => http.post('/careers', data),
  update: (id: string, data: any) => http.put(`/careers/${id}`, data),
  delete: (id: string) => http.delete(`/careers/${id}`),
  batchImport: (careers: any[]) => http.post('/careers/batch', { careers })
}

// ============ 用户管理 API ============

export const userApi = {
  list: (params?: any) => http.get('/users', { params }),
  detail: (id: string) => http.get(`/users/${id}`),
  disable: (id: string) => http.post(`/users/${id}/disable`),
  enable: (id: string) => http.post(`/users/${id}/enable`)
}

// ============ 统计 API ============

export const statsApi = {
  overview: () => http.get('/stats/overview'),
  testTrend: (days?: number) => http.get('/stats/test-trend', { params: { days } }),
  userTrend: (days?: number) => http.get('/stats/user-trend', { params: { days } }),
  popularTests: () => http.get('/stats/popular-tests'),
  activityDistribution: () => http.get('/stats/activity-distribution')
}

// ============ 认证 API ============

export const authApi = {
  login: (username: string, password: string) => http.post('/auth/login', { username, password }),
  logout: () => http.post('/auth/logout')
}

export default http
