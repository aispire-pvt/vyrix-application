import StepButton from './StepButton'
import panelImage from '../../assets/signup-panel.png'
import logo from '../../assets/signup-logo.png'

const STEPS = [
  { number: 1, label: 'Sign up your account' },
  { number: 2, label: 'Set up your profile' },
  { number: 3, label: 'Know about your workspace' },
]

// Shared left panel used across Signup / Profile / Tutorials screens.
// `activeStep` (1|2|3) lights up steps 1..activeStep as completed/active (white).
export default function OnboardingSidebar({ activeStep = 1 }) {
  return (
    <aside className="relative hidden w-[1001px] max-w-[52%] shrink-0 overflow-hidden rounded-54 bg-black lg:block">
      <img
        src={panelImage}
        alt=""
        className="absolute inset-0 h-full w-full scale-110 object-cover object-top blur-[10px]"
      />
      <div className="absolute inset-0 bg-vyrix-overlay" />

      {/* Logo — centered horizontally */}
      <img
        src={logo}
        alt="Vyrix"
        className="absolute left-1/2 top-[13%] w-[37%] max-w-[378px] -translate-x-1/2"
      />

      {/* Heading + steps (lower area) */}
      <div className="relative z-10 flex h-full flex-col items-center justify-end px-12 pb-[11%] text-center">
        <h2 className="font-unbounded text-[40px] font-medium leading-tight text-white">
          Get Started with Us
        </h2>
        <p className="mt-4 max-w-[439px] font-sf text-[20px] text-vyrix-placeholder">
          Complete these easy steps to get started with your research journey.
        </p>

        <div className="mt-9 flex w-[389px] max-w-full flex-col gap-3">
          {STEPS.map((step) => (
            <StepButton
              key={step.number}
              number={step.number}
              label={step.label}
              isActive={step.number <= activeStep}
            />
          ))}
        </div>
      </div>
    </aside>
  )
}
