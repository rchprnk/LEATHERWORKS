import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
})

api.interceptors.response.use(
  (res) => res,
  (error) => {
    const serverError = error?.response?.data?.error || error?.response?.data?.message
    if (serverError) error.message = serverError
    return Promise.reject(error)
  }
)

export const getPortfolio = () => api.get('/api/portfolio')
export const submitQuote = (data) => api.post('/api/contact', data)

export default api
