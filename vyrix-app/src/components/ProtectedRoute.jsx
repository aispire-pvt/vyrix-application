import { useEffect, useState } from 'react'
import { Navigate, Outlet } from 'react-router-dom'

export default function ProtectedRoute() {
  const [status, setStatus] = useState('checking') // 'checking' | 'allowed' | 'login' | 'onboard'

  useEffect(() => {
    let active = true
    window.vyrix.getMe()
      .then((res) => {
        if (!active) return
        const u = res?.user
        if (!u) { setStatus('login'); return }
        if (!u.emailVerified || !u.onboardingCompleted) setStatus('onboard')
        else setStatus('allowed')
      })
      .catch(() => { if (active) setStatus('login') })
    return () => { active = false }
  }, [])

  if (status === 'checking') {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-black">
        <p className="font-unbounded text-lg text-[#d5d5d5]">Loading...</p>
      </div>
    )
  }
  if (status === 'login')  return <Navigate to="/login" replace />
  if (status === 'onboard') return <Navigate to="/profile" replace />
  return <Outlet />
}
