import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://api.primeleatherrepair.com',
})

export const ADMIN_TOKEN_STORAGE_KEY = 'primeLeatherAdminToken'

export function getAdminToken() {
  try {
    return localStorage.getItem(ADMIN_TOKEN_STORAGE_KEY) || ''
  } catch {
    return ''
  }
}

export function setAdminToken(token) {
  try {
    if (token) localStorage.setItem(ADMIN_TOKEN_STORAGE_KEY, token)
    else localStorage.removeItem(ADMIN_TOKEN_STORAGE_KEY)
  } catch {
    // ignore storage failures
  }
}

api.interceptors.request.use((config) => {
  const token = getAdminToken()
  if (token) {
    config.headers = config.headers || {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error?.response?.status
    const serverMsg = error?.response?.data?.error || error?.response?.data?.message

    if (error?.code === 'ECONNABORTED' || /timeout/i.test(String(error?.message || ''))) {
      error.message = 'Request timed out. Please try again.'
      return Promise.reject(error)
    }

    if (error?.code === 'ERR_CANCELED') {
      error.message = 'Request cancelled.'
      return Promise.reject(error)
    }

    if (!error?.response) {
      error.message =
        'Server not reachable. Check that the backend is running and `VITE_API_URL` points to it.'
      return Promise.reject(error)
    }

    if (serverMsg) {
      error.message = serverMsg
      return Promise.reject(error)
    }

    if (status === 401) error.message = 'Unauthorized (401). Check authentication/keys.'
    else if (status === 403) error.message = 'Forbidden (403).'
    else if (status === 404) error.message = 'Not found (404).'
    else if (status && status >= 500) error.message = `Server error (${status}).`
    else if (status) error.message = `Request failed (${status}).`
    return Promise.reject(error)
  }
)

export const getPortfolio = (params = {}) => api.get('/api/portfolio', { params })
export const getCategories = () => api.get('/api/categories')
export const getContact = () => api.get('/api/contact')
export const getGoogleReviews = (params = {}) => api.get('/api/google-reviews', { params })

export default api
