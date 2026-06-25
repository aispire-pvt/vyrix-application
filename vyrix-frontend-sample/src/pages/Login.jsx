import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGoogleLogin } from '@react-oauth/google'
import api from '../api/axios'
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

  // Google sign-in (implicit flow → access token → backend verifies + upserts).
  const googleLogin = useGoogleLogin({
    scope: 'openid email profile',
    onSuccess: async (tokenResponse) => {
      setError('')
      setLoading(true)
      try {
        const { data } = await api.post('/api/auth/google', {
          accessToken: tokenResponse.access_token,
        })
        navigate(data.onboardingCompleted ? '/home' : '/profile')
      } catch (err) {
        setError(err.response?.data?.message || 'Google sign-in failed. Please try again.')
      } finally {
        setLoading(false)
      }
    },
    onError: () => setError('Google sign-in was cancelled.'),
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!form.email || !form.password) {
      setError('Please enter your email and password.')
      return
    }

    setLoading(true)
    try {
      await api.post('/api/auth/login', form)
      // Gate: only verified + onboarded users reach the app; others finish onboarding.
      const { data } = await api.get('/api/auth/me')
      const u = data.user
      if (!u?.emailVerified || !u?.onboardingCompleted) {
        navigate('/profile')
      } else {
        navigate('/home')
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'Something went wrong. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen w-full items-start justify-center overflow-hidden bg-black">
      {/* Background arc */}
      <img
        src={bgImage}
        alt=""
        className="pointer-events-none absolute inset-0 h-full w-full object-cover object-top"
      />

      {/* Centered content */}
      <form
        onSubmit={handleSubmit}
        className="relative z-10 flex w-[434px] max-w-[90%] flex-col items-center pt-[180px] pb-16"
      >
        <img src={logo} alt="Vyrix" className="w-[316px] max-w-full" />

        <h1 className="mt-[80px] whitespace-nowrap text-center font-unbounded text-[40px] font-medium leading-tight text-white">
          Log in your Account
        </h1>

        <div className="mt-10 flex w-full flex-col gap-[18px]">
          <InputField
            label="Email"
            placeholder="eg. Johnparker@vyrix.com"
            type="email"
            value={form.email}
            onChange={update('email')}
          />

          <InputField
            label="Password"
            placeholder="Enter your password"
            type={showPassword ? 'text' : 'password'}
            value={form.password}
            onChange={update('password')}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="flex items-center"
                aria-label="Toggle password visibility"
              >
                <img src={eyeIcon} alt="" className="h-[16px] w-[21px]" />
              </button>
            }
          />
        </div>

        {error && (
          <p className="mt-4 w-full text-center font-sf text-[14px] text-red-400">
            {error}
          </p>
        )}

        <Button variant="primary" className="mt-7" type="submit">
          {loading ? 'Signing in...' : 'Sign in'}
        </Button>

        <Divider className="mt-6 w-full" />

        <Button variant="outline" className="mt-6" type="button" onClick={() => googleLogin()}>
          <img src={googleIcon} alt="" className="h-[22px] w-[22px]" />
          Google
        </Button>

        <p className="mt-7 text-center font-sf text-[14px] text-vyrix-placeholder">
          Dont have an Account?{' '}
          <button
            type="button"
            onClick={() => navigate('/signup')}
            className="font-bold text-vyrix-link-purple"
          >
            Sign Up
          </button>
        </p>
      </form>
    </div>
  )
}
