import axios from 'axios'

// Used only for auth / onboarding / feedback / catalog routes.
// Docs, folders, todos go through window.vyrix IPC — not axios.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://vyrix-app.onrender.com',
  // No withCredentials — Electron uses Bearer tokens via the main process.
  // Auth calls go through window.vyrix.login() / getMe() — not directly here.
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 403) {
      window.location.hash = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
