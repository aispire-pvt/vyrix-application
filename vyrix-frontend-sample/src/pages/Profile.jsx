import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import InputField from '../components/ui/InputField'
import Button from '../components/ui/Button'
import OnboardingSidebar from '../components/onboarding/OnboardingSidebar'

import defaultAvatar from '../assets/avatar.png'

export default function Profile() {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)

  const [form, setForm] = useState({ username: '', profession: '', otp: '' })
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)

  const [otpSent, setOtpSent] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [sendingOtp, setSendingOtp] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const update = (key) => (e) => setForm({ ...form, [key]: e.target.value })

  const handlePickFile = (e) => {
    const picked = e.target.files?.[0]
    if (picked) {
      setFile(picked)
      setPreview(URL.createObjectURL(picked))
    }
  }

  // Step 1: request an OTP to the registered email.
  const handleSendOtp = async () => {
    setError('')
    setInfo('')
    setSendingOtp(true)
    try {
      const { data } = await api.post('/api/onboarding/send-otp')
      setOtpSent(true)
      setInfo(data.message || 'A verification code has been sent to your email.')
    } catch (err) {
      setError(
        err.response?.data?.message || 'Could not send the verification code.'
      )
    } finally {
      setSendingOtp(false)
    }
  }

  // Step 2: verify the OTP, then save the profile and continue.
  const handleContinue = async () => {
    setError('')
    if (!form.otp) {
      setError('Please enter the verification code sent to your email.')
      return
    }

    setSubmitting(true)
    try {
      await api.post('/api/onboarding/verify-otp', { otp: form.otp })

      const fd = new FormData()
      fd.append('username', form.username)
      fd.append('profession', form.profession)
      if (file) fd.append('profile_pic', file)

      await api.post('/api/onboarding/profile', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      navigate('/tutorials')
    } catch (err) {
      setError(
        err.response?.data?.message || 'Verification failed. Please try again.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full items-stretch gap-8 bg-black p-7">
      {/* Left panel — steps 1 & 2 active */}
      <OnboardingSidebar activeStep={2} />

      {/* Right panel — profile form */}
      <section className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="flex w-[434px] max-w-full flex-col">
          <h1 className="whitespace-nowrap text-center font-unbounded text-[40px] font-medium leading-tight text-white">
            Setting up your Profile
          </h1>
          <p className="mt-3 text-center font-sf text-[20px] text-vyrix-label">
            Create your personal profile
          </p>

          {/* Avatar with Edit overlay */}
          <div className="relative mx-auto mt-8 w-[105px]">
            <img
              src={preview || defaultAvatar}
              alt="Profile avatar"
              className="h-[105px] w-[105px] rounded-full object-cover"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute -right-7 bottom-2 flex h-[25px] w-[57px] items-center justify-center rounded-11 bg-vyrix-input font-sf text-[12px] text-vyrix-placeholder"
            >
              Edit
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePickFile}
              className="hidden"
            />
          </div>

          {/* Fields */}
          <div className="mt-8 flex flex-col gap-[18px]">
            <InputField
              label="Create your username"
              placeholder="eg. John3399"
              value={form.username}
              onChange={update('username')}
            />
            <InputField
              label="Enter your Profession"
              placeholder="Student / Teacher / Employee , etc"
              value={form.profession}
              onChange={update('profession')}
            />
          </div>

          <Button
            variant="primary"
            className="mt-7"
            type="button"
            onClick={handleSendOtp}
          >
            {sendingOtp
              ? 'Sending code...'
              : otpSent
                ? 'Resend code'
                : 'Verify your Email'}
          </Button>

          {/* OTP — shown after a code has been sent */}
          {otpSent && (
            <InputField
              className="mt-5 w-[206px] self-center"
              placeholder="Enter OTP"
              inputClassName="text-center"
              value={form.otp}
              onChange={update('otp')}
            />
          )}

          {info && (
            <p className="mt-3 text-center font-sf text-[13px] text-vyrix-placeholder">
              {info}
            </p>
          )}
          {error && (
            <p className="mt-3 text-center font-sf text-[13px] text-red-400">
              {error}
            </p>
          )}

          <button
            type="button"
            onClick={handleContinue}
            disabled={!otpSent || submitting}
            className="mt-5 text-center font-sf text-[14px] font-bold text-vyrix-link-purple disabled:opacity-50"
          >
            {submitting ? 'Please wait...' : 'Continue'}
          </button>
        </div>
      </section>
    </div>
  )
}
