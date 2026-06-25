import axios from 'axios'

// Single axios instance for all API calls.
// Base URL comes from VITE_API_URL in production (set in Vercel);
// falls back to the local backend during development.
// withCredentials sends the httpOnly JWT cookie with every request.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  withCredentials: true,
})

// If the session is invalid/expired, the backend returns 403 — send the user to login.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 403) {
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api
