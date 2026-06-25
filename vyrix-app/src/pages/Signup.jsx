import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import InputField from '../components/ui/InputField'
import Button from '../components/ui/Button'
import Divider from '../components/ui/Divider'
import OnboardingSidebar from '../components/onboarding/OnboardingSidebar'
import LegalModal from '../components/ui/LegalModal'
import { PRIVACY_POLICY_TEXT, TERMS_OF_USE_TEXT, NDA_TEXT } from '../constants/legalText'

import googleIcon from '../assets/google.png'
import eyeIcon from '../assets/eye.png'

export default function Signup() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [legalAccepted, setLegalAccepted] = useState(false)
  const [modal, setModal] = useState(null) // 'terms' | 'privacy' | 'nda' | null

  const update = (key) => (e) => setForm({ ...form, [key]: e.target.value })

  const handleGoogle = () => {
    setError('')
    setLoading(true)
    window.vyrix.loginGoogle()

    const onDeepLink = (_, { token, error: err }) => {
      window.vyrix.off('auth:deepLink', onDeepLink)
      setLoading(false)
      if (err || !token) { setError(err || 'Google sign-in failed.'); return }
      window.vyrix.saveToken(token).then(async (result) => {
        if (!result?.success) { setError(result?.message || 'Google sign-in failed.'); return }
        // Google users skip the signup form — route them through /profile so they
        // accept Terms/Privacy/NDA + finish onboarding before reaching /home.
        try {
          const [meRes, legal] = await Promise.all([
            window.vyrix.getMe(),
            window.vyrix.legal.status(),
          ])
          const u = meRes?.user
          const legallyDone = legal?.ndaAccepted && legal?.termsAccepted && legal?.privacyAccepted
          if (!u?.onboardingCompleted || !legallyDone) navigate('/profile')
          else navigate('/home')
        } catch {
          navigate('/profile')
        }
      })
    }
    window.vyrix.on('auth:deepLink', onDeepLink)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.firstName || !form.lastName || !form.email || !form.password) { setError('Please fill in all fields.'); return }
    if (form.password.length < 8) { setError('Password must be at least 8 characters.'); return }
    if (!legalAccepted) { setError('You must agree to the Terms of Use, Privacy Policy, and Beta Tester NDA.'); return }
    setLoading(true)
    try {
      const result = await window.vyrix.register(form)
      if (!result.success) { setError(result.message || 'Registration failed.'); return }
      await window.vyrix.legal.accept({ terms: true, privacy: true, nda: true, userName: `${form.firstName} ${form.lastName}` })
      navigate('/profile')
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
    {modal === 'terms'   && <LegalModal title="Terms of Use"    onClose={() => setModal(null)}><TermsContent /></LegalModal>}
    {modal === 'privacy' && <LegalModal title="Privacy Policy"  onClose={() => setModal(null)}><PrivacyContent /></LegalModal>}
    {modal === 'nda'     && <LegalModal title="Beta Tester NDA" onClose={() => setModal(null)}><NDAContent /></LegalModal>}
    <div className="flex h-screen w-full items-stretch gap-6 bg-black p-5">
      <OnboardingSidebar activeStep={1} />

      <section className="flex flex-1 items-center justify-center px-4 py-6">
        <form onSubmit={handleSubmit} className="flex w-[434px] max-w-full flex-col">
          <h1 className="text-center font-unbounded text-[28px] font-medium leading-tight text-white">Sign up your Account</h1>
          <p className="mt-2 text-center font-sf text-[15px] text-vyrix-label">Enter your personal details to create your account</p>

          <div className="mt-6 flex flex-col gap-[14px]">
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
              <p className="mt-1 font-sf text-[13px] text-vyrix-placeholder">Must be at least 8 characters</p>
            </div>
          </div>

          {/* Legal acceptance checkbox */}
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

          {error && <p className="mt-3 text-center font-sf text-[13px] text-red-400">{error}</p>}

          <Divider className="mt-4" />
          <Button variant="outline" className="mt-4" type="button" onClick={handleGoogle}>
            <img src={googleIcon} alt="" className="h-[22px] w-[22px]" />
            Google
          </Button>
          <Button variant="primary" className="mt-3" type="submit" disabled={loading}>
            {loading ? 'Creating account...' : 'Sign Up'}
          </Button>

          <p className="mt-4 text-center font-sf text-[14px] text-vyrix-placeholder">
            Already have an Account?{' '}
            <button type="button" onClick={() => navigate('/login')} className="font-bold text-vyrix-link-blue">Log In</button>
          </p>
        </form>
      </section>
    </div>
    </>
  )
}

function TermsContent() {
  return (
    <div className="flex flex-col gap-3">
      <p className="font-unbounded text-[12px] text-[#a3a3a3]">Aispire Private Limited — Last Updated: June 24, 2026</p>
      {TERMS_OF_USE_TEXT.map((section, i) => (
        <div key={i}>
          {section.heading && <h3 className="mt-3 font-sf text-[13px] font-bold text-white">{section.heading}</h3>}
          <p className="whitespace-pre-wrap font-sf text-[13px] text-[#c7c7c7]">{section.body}</p>
        </div>
      ))}
    </div>
  )
}

function PrivacyContent() {
  return (
    <div className="flex flex-col gap-3">
      <p className="font-unbounded text-[12px] text-[#a3a3a3]">Aispire Private Limited — Last Updated: June 24, 2026</p>
      {PRIVACY_POLICY_TEXT.map((section, i) => (
        <div key={i}>
          {section.heading && <h3 className="mt-3 font-sf text-[13px] font-bold text-white">{section.heading}</h3>}
          <p className="whitespace-pre-wrap font-sf text-[13px] text-[#c7c7c7]">{section.body}</p>
        </div>
      ))}
    </div>
  )
}

function NDAContent() {
  return (
    <div className="flex flex-col gap-3">
      <p className="font-unbounded text-[12px] text-[#a3a3a3]">Aispire Private Limited — Beta Tester NDA</p>
      {NDA_TEXT.map((section, i) => (
        <div key={i}>
          {section.heading && <h3 className="mt-3 font-sf text-[13px] font-bold text-white">{section.heading}</h3>}
          <p className="whitespace-pre-wrap font-sf text-[13px] text-[#c7c7c7]">{section.body}</p>
        </div>
      ))}
    </div>
  )
}
