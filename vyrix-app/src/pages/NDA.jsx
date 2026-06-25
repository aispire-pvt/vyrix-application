import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { NDA_TEXT } from '../constants/legalText'
import OnboardingSidebar from '../components/onboarding/OnboardingSidebar'

export default function NDA() {
  const navigate = useNavigate()
  const [accepted, setAccepted] = useState(false)
  const [userName, setUserName] = useState('')
  const [loading, setLoading] = useState(false)
  const [checkingStatus, setCheckingStatus] = useState(true)

  useEffect(() => {
    window.vyrix.legal.status().then((s) => {
      if (s.ndaAccepted) navigate('/tutorials', { replace: true })
      else {
        window.vyrix.getMe().then((res) => {
          if (res?.user?.name) setUserName(res.user.name)
        }).catch(() => {})
        setCheckingStatus(false)
      }
    })
  }, [navigate])

  const handleAccept = async () => {
    if (!accepted) return
    setLoading(true)
    await window.vyrix.legal.accept({ nda: true, terms: true, privacy: true, userName })
    navigate('/tutorials')
  }

  if (checkingStatus) return null

  return (
    <div className="flex h-screen w-full items-stretch gap-6 bg-black p-5">
      <OnboardingSidebar activeStep={2} />

      <section className="flex flex-1 flex-col px-12 py-10">
        <div className="flex w-full items-start justify-between">
          <div>
            <h1 className="font-unbounded text-[28px] font-medium leading-tight text-white">Beta Tester NDA</h1>
            <p className="mt-1 font-sf text-[14px] text-[#a3a3a3]">Please read and accept the Non-Disclosure Agreement to continue.</p>
          </div>
          <div className="font-sf text-[12px] text-[#6b6b6b]">Aispire Private Limited · Dehradun, India</div>
        </div>

        {/* NDA content */}
        <div className="mt-6 flex-1 overflow-y-auto rounded-2xl border border-white/10 bg-[#0d0d0d] p-6">
          <h2 className="font-unbounded text-[15px] font-medium text-white">BETA TESTER NON-DISCLOSURE AGREEMENT</h2>
          <p className="mt-3 font-sf text-[13px] leading-relaxed text-[#c7c7c7]">
            This Agreement is between Aispire Private Limited, registered at Dehradun ("Company"), and the individual accepting below
            ("Beta Tester"), entered into on the date of acceptance in connection with participation in the closed Vyrix Beta 1
            testing programme ("Beta Programme").
          </p>

          {NDA_TEXT.map((section, i) => (
            <div key={i} className="mt-5">
              <h3 className="font-sf text-[13px] font-bold uppercase tracking-wide text-white">{section.heading}</h3>
              <p className="mt-2 whitespace-pre-wrap font-sf text-[13px] leading-relaxed text-[#c7c7c7]">{section.body}</p>
            </div>
          ))}
        </div>

        {/* Acceptance */}
        <div className="mt-5 rounded-2xl border border-white/10 bg-[#0d0d0d] p-5">
          <p className="font-sf text-[13px] text-[#a3a3a3]">
            By checking below, <span className="text-white">{userName || 'you'}</span>, acknowledge that you have carefully read and
            understood this Agreement and agree to be bound by its terms and conditions.
          </p>

          <label className="mt-4 flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
              className="mt-[2px] h-4 w-4 shrink-0 accent-[#b2c5f2]"
            />
            <span className="font-sf text-[13px] text-[#c7c7c7]">
              I, <strong className="text-white">{userName || '(your name)'}</strong>, have read, understood, and agree to the Beta Tester
              Non-Disclosure Agreement above. I understand my obligations regarding confidentiality.
            </span>
          </label>

          <div className="mt-5 flex items-center justify-between">
            <p className="font-sf text-[12px] text-[#6b6b6b]">Date of acceptance: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            <button
              onClick={handleAccept}
              disabled={!accepted || loading}
              className={`rounded-xl px-8 py-3 font-sf text-[14px] font-bold transition ${
                accepted && !loading
                  ? 'bg-[#b2c5f2] text-[#0e1022] hover:bg-[#c5d4f5]'
                  : 'cursor-not-allowed bg-white/10 text-[#6b6b6b]'
              }`}
            >
              {loading ? 'Saving...' : 'Accept & Continue'}
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
