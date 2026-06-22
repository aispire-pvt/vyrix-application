import { useEffect, useState } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import api from '../api/axios'

// Guards the app's authenticated routes.
// - Not logged in            → /login
// - Logged in but incomplete → /profile (verify email + finish onboarding)
// - Verified + onboarded     → render the route
export default function ProtectedRoute() {
  const [status, setStatus] = useState('checking') // 'checking' | 'allowed' | 'login' | 'onboard'

  useEffect(() => {
    let active = true
    api
      .get('/api/auth/me')
      .then(({ data }) => {
        if (!active) return
        const u = data.user
        if (!u?.emailVerified || !u?.onboardingCompleted) {
          setStatus('onboard')
        } else {
          setStatus('allowed')
        }
      })
      .catch(() => {
        if (active) setStatus('login')
      })
    return () => {
      active = false
    }
  }, [])

  if (status === 'checking') {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-black">
        <p className="font-unbounded text-lg text-[#d5d5d5]">Loading...</p>
      </div>
    )
  }
  if (status === 'login') return <Navigate to="/login" replace />
  if (status === 'onboard') return <Navigate to="/profile" replace />
  return <Outlet />
}
