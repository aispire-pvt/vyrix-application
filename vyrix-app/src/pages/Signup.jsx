import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import InputField from '../components/ui/InputField'
import Button from '../components/ui/Button'
import Divider from '../components/ui/Divider'
import OnboardingSidebar from '../components/onboarding/OnboardingSidebar'

import googleIcon from '../assets/google.png'
import eyeIcon from '../assets/eye.png'

export default function Signup() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const update = (key) => (e) => setForm({ ...form, [key]: e.target.value })

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

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.firstName || !form.lastName || !form.email || !form.password) { setError('Please fill in all fields.'); return }
    if (form.password.length < 8) { setError('Password must be at least 8 characters.'); return }
    setLoading(true)
    try {
      await api.post('/api/auth/register', form)
      navigate('/profile')
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full items-stretch gap-8 bg-black p-7">
      <OnboardingSidebar activeStep={1} />

      <section className="flex flex-1 items-center justify-center px-4 py-10">
        <form onSubmit={handleSubmit} className="flex w-[434px] max-w-full flex-col">
          <h1 className="text-center font-unbounded text-[40px] font-medium leading-tight text-white">Sign up your Account</h1>
          <p className="mt-3 text-center font-sf text-[20px] text-vyrix-label">Enter your personal details to create your account</p>

          <div className="mt-10 flex flex-col gap-[18px]">
            <div className="flex gap-[9px]">
              <InputField className="flex-[206]" label="First Name" placeholder="eg. John" value={form.firstName} onChange={update('firstName')} />
              <InputField className="flex-[219]" label="Last Name" placeholder="eg. Parker" value={form.lastName} onChange={update('lastName')} />
            </div>
            <InputField label="Email" placeholder="eg. Johnparker@vyrix.com" type="email" value={form.email} onChange={update('email')} />
            <div>
              <InputField label="Set up your password" placeholder="Enter your password"
                type={showPassword ? 'text' : 'password'} value={form.password} onChange={update('password')}
                rightIcon={
                  <button type="button" onClick={() => setShowPassword((v) => !v)} className="flex items-center" aria-label="Toggle password visibility">
                    <img src={eyeIcon} alt="" className="h-[16px] w-[21px]" />
                  </button>
                }
              />
              <p className="mt-2 font-sf text-[16px] text-vyrix-placeholder">Must be at least 8 characters</p>
            </div>
          </div>

          {error && <p className="mt-4 text-center font-sf text-[14px] text-red-400">{error}</p>}

          <Divider className="mt-5" />
          <Button variant="outline" className="mt-5" type="button" onClick={handleGoogle}>
            <img src={googleIcon} alt="" className="h-[22px] w-[22px]" />
            Google
          </Button>
          <Button variant="primary" className="mt-4" type="submit">{loading ? 'Creating account...' : 'Sign Up'}</Button>

          <p className="mt-6 text-center font-sf text-[14px] text-vyrix-placeholder">
            Already have an Account?{' '}
            <button type="button" onClick={() => navigate('/login')} className="font-bold text-vyrix-link-blue">Log In</button>
          </p>
        </form>
      </section>
    </div>
  )
}
