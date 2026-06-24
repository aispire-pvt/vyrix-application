import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import InputField from '../components/ui/InputField'
import Button from '../components/ui/Button'
import Divider from '../components/ui/Divider'

import bgImage from '../assets/login-bg.png'
import logo from '../assets/login-logo.png'
import googleIcon from '../assets/google.png'
import eyeIcon from '../assets/eye.png'

export default function Login() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const update = (key) => (e) => setForm({ ...form, [key]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.email || !form.password) { setError('Please enter your email and password.'); return }
    setLoading(true)
    try {
      const result = await window.vyrix.login({ email: form.email, password: form.password })
      if (!result.success) { setError(result.message || 'Login failed.'); return }
      const meRes = await window.vyrix.getMe()
      const u = meRes.user
      if (!u?.emailVerified || !u?.onboardingCompleted) navigate('/profile')
      else navigate('/home')
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    setError('')
    setLoading(true)
    try {
      const result = await window.vyrix.loginGoogle()
      if (!result?.success) { setError(result?.message || 'Google sign-in failed.'); return }
      navigate('/home')
    } catch {
      setError('Google sign-in was cancelled.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen w-full items-start justify-center overflow-hidden bg-black">
      <img src={bgImage} alt="" className="pointer-events-none absolute inset-0 h-full w-full object-cover object-top" />

      <form onSubmit={handleSubmit} className="relative z-10 flex w-[434px] max-w-[90%] flex-col items-center pt-[180px] pb-16">
        <img src={logo} alt="Vyrix" className="w-[316px] max-w-full" />

        <h1 className="mt-[80px] whitespace-nowrap text-center font-unbounded text-[40px] font-medium leading-tight text-white">Log in your Account</h1>

        <div className="mt-10 flex w-full flex-col gap-[18px]">
          <InputField label="Email" placeholder="eg. Johnparker@vyrix.com" type="email" value={form.email} onChange={update('email')} />
          <InputField
            label="Password" placeholder="Enter your password"
            type={showPassword ? 'text' : 'password'}
            value={form.password} onChange={update('password')}
            rightIcon={
              <button type="button" onClick={() => setShowPassword((v) => !v)} className="flex items-center" aria-label="Toggle password visibility">
                <img src={eyeIcon} alt="" className="h-[16px] w-[21px]" />
              </button>
            }
          />
        </div>

        {error && <p className="mt-4 w-full text-center font-sf text-[14px] text-red-400">{error}</p>}

        <Button variant="primary" className="mt-7" type="submit">{loading ? 'Signing in...' : 'Sign in'}</Button>
        <Divider className="mt-6 w-full" />
        <Button variant="outline" className="mt-6" type="button" onClick={handleGoogle}>
          <img src={googleIcon} alt="" className="h-[22px] w-[22px]" />
          Google
        </Button>

        <p className="mt-7 text-center font-sf text-[14px] text-vyrix-placeholder">
          Dont have an Account?{' '}
          <button type="button" onClick={() => navigate('/signup')} className="font-bold text-vyrix-link-purple">Sign Up</button>
        </p>
      </form>
    </div>
  )
}
