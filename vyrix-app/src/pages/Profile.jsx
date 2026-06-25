import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import InputField from '../components/ui/InputField'
import Button from '../components/ui/Button'
import OnboardingSidebar from '../components/onboarding/OnboardingSidebar'
import LegalModal from '../components/ui/LegalModal'
import { TERMS_OF_USE_TEXT, PRIVACY_POLICY_TEXT, NDA_TEXT } from '../constants/legalText'

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

  // Google users arrive already email-verified → skip the OTP step.
  const [alreadyVerified, setAlreadyVerified] = useState(false)
  const [checking, setChecking] = useState(true)

  // Legal acceptance — required for Google users (signup form covers password users).
  const [legalRequired, setLegalRequired] = useState(false)
  const [legalAccepted, setLegalAccepted] = useState(false)
  const [modal, setModal] = useState(null) // 'terms' | 'privacy' | 'nda' | null
  const [userFullName, setUserFullName] = useState('')

  useEffect(() => {
    let active = true
    Promise.all([window.vyrix.getMe(), window.vyrix.legal.status()])
      .then(([data, legal]) => {
        if (!active) return
        const u = data.user
        if (!u) { navigate('/login'); return }
        if (u?.onboardingCompleted) { navigate('/home'); return }
        setAlreadyVerified(!!u?.emailVerified)
        setUserFullName(`${u?.firstName || ''} ${u?.lastName || ''}`.trim())
        setForm((f) => ({ ...f, username: u?.username || '', profession: u?.profession || '' }))
        const needsLegal = !(legal?.ndaAccepted && legal?.termsAccepted && legal?.privacyAccepted)
        setLegalRequired(needsLegal)
        setChecking(false)
      })
      .catch(() => { if (active) navigate('/login') })
    return () => { active = false }
  }, [navigate])

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
      const data = await window.vyrix.onboarding.sendOtp()
      if (!data.success) { setError(data.message || 'Could not send the verification code.'); return }
      setOtpSent(true)
      setInfo(data.message || 'A verification code has been sent to your email.')
    } catch {
      setError('Could not send the verification code.')
    } finally {
      setSendingOtp(false)
    }
  }

  // Verify the OTP (unless already verified via Google), then save the profile.
  const handleContinue = async () => {
    setError('')
    if (!form.username.trim() || !form.profession.trim()) {
      setError('Please enter your username and profession.')
      return
    }
    if (legalRequired && !legalAccepted) {
      setError('You must agree to the Terms of Use, Privacy Policy, and Beta Tester NDA.')
      return
    }
    if (!alreadyVerified && !form.otp) {
      setError('Please enter the verification code sent to your email.')
      return
    }

    setSubmitting(true)
    try {
      if (!alreadyVerified) {
        const otpRes = await window.vyrix.onboarding.verifyOtp(form.otp)
        if (!otpRes.success) { setError(otpRes.message || 'Invalid verification code.'); return }
      }

      if (legalRequired) {
        await window.vyrix.legal.accept({
          terms: true, privacy: true, nda: true,
          userName: userFullName || form.username.trim(),
        })
      }

      const filePath = file?.path || null
      const profileRes = await window.vyrix.onboarding.saveProfile(form.username.trim(), form.profession.trim(), filePath)
      if (!profileRes.success) { setError(profileRes.message || 'Something went wrong.'); return }

      navigate('/tutorials')
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (checking) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-black">
        <p className="font-unbounded text-lg text-[#d5d5d5]">Loading...</p>
      </div>
    )
  }

  return (
    <>
    {modal === 'terms'   && <LegalModal title="Terms of Use"    onClose={() => setModal(null)}><LegalSections sections={TERMS_OF_USE_TEXT} /></LegalModal>}
    {modal === 'privacy' && <LegalModal title="Privacy Policy"  onClose={() => setModal(null)}><LegalSections sections={PRIVACY_POLICY_TEXT} /></LegalModal>}
    {modal === 'nda'     && <LegalModal title="Beta Tester NDA" onClose={() => setModal(null)}><LegalSections sections={NDA_TEXT} /></LegalModal>}
    <div className="flex h-screen w-full items-stretch gap-6 bg-black p-5">
      {/* Left panel — steps 1 & 2 active */}
      <OnboardingSidebar activeStep={2} />

      {/* Right panel — profile form */}
      <section className="flex flex-1 items-center justify-center px-4 py-6">
        <div className="flex w-[434px] max-w-full flex-col">
          <h1 className="whitespace-nowrap text-center font-unbounded text-[28px] font-medium leading-tight text-white">
            Setting up your Profile
          </h1>
          <p className="mt-2 text-center font-sf text-[15px] text-vyrix-label">
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

          {/* Legal acceptance — shown for users who haven't accepted yet (e.g. Google sign-in). */}
          {legalRequired && (
            <label className="mt-4 flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={legalAccepted}
                onChange={(e) => setLegalAccepted(e.target.checked)}
                className="mt-[2px] h-4 w-4 shrink-0 accent-[#b2c5f2]"
              />
              <span className="font-sf text-[13px] text-[#a3a3a3]">
                I agree to the{' '}
                <button type="button" onClick={() => setModal('terms')} className="text-[#b2c5f2] underline underline-offset-2">Terms of Use</button>
                ,{' '}
                <button type="button" onClick={() => setModal('privacy')} className="text-[#b2c5f2] underline underline-offset-2">Privacy Policy</button>
                {', and the '}
                <button type="button" onClick={() => setModal('nda')} className="text-[#b2c5f2] underline underline-offset-2">Beta Tester NDA</button>
              </span>
            </label>
          )}

          {/* Google users are already verified → straight to Continue.
              Password users verify their email with an OTP first. */}
          {alreadyVerified ? (
            <>
              {error && (
                <p className="mt-3 text-center font-sf text-[13px] text-red-400">
                  {error}
                </p>
              )}
              <Button
                variant="primary"
                className="mt-7"
                type="button"
                onClick={handleContinue}
              >
                {submitting ? 'Please wait...' : 'Continue'}
              </Button>
            </>
          ) : (
            <>
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
            </>
          )}
        </div>
      </section>
    </div>
    </>
  )
}

function LegalSections({ sections }) {
  return (
    <div className="flex flex-col gap-3">
      {sections.map((section, i) => (
        <div key={i}>
          {section.heading && <h3 className="mt-3 font-sf text-[13px] font-bold text-white">{section.heading}</h3>}
          <p className="whitespace-pre-wrap font-sf text-[13px] text-[#c7c7c7]">{section.body}</p>
        </div>
      ))}
    </div>
  )
}
