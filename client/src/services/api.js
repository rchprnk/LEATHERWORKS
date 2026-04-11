import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5002',
})

api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error?.response?.status
    const serverMsg = error?.response?.data?.error || error?.response?.data?.message

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

export const getPortfolio = () => api.get('/api/portfolio')
export const submitQuote = (data) => api.post('/api/contact', data)

export default api
