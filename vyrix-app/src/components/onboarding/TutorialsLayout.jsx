import OnboardingSidebar from './OnboardingSidebar'
import tutorialMedia from '../../assets/tutorial-preview.png'

const PARAGRAPHS = [
  `Research is hard. Synthesis is harder. You collect data from papers, interviews, spreadsheets, and articles but they live in different tools, scattered across your computer and your mind. When it comes to time to write, you're staring at a blank page, dozens of notes, and a nagging feeling that you're missing the logical thread.`,
  `Vyrix solves this by bringing all your sources into one unified space, guiding you through synthesis with structured steps, and providing AI mentorship that validates your thinking in real time. Let's go from scattered overwhelm to confident, evidence backed writing.`,
]

// Shared layout for the Tutorials screens (Desktop-4 "Skip" and Desktop-5 "Next").
// Props:
//   linkLabel     — top-right link text ("Skip" | "Next")
//   linkColorClass — tailwind text color class for the link
//   onLinkClick   — handler for the link
export default function TutorialsLayout({ linkLabel, linkColorClass, onLinkClick }) {
  return (
    <div className="flex h-screen w-full items-stretch gap-8 overflow-hidden bg-black p-7">
      {/* Left panel — all 3 steps active */}
      <OnboardingSidebar activeStep={3} />

      {/* Right panel — tutorial content (scrolls on short viewports) */}
      <section className="flex flex-1 flex-col overflow-y-auto px-12 py-6">
        <div className="flex w-full items-start justify-between">
          <h1 className="font-unbounded text-[32px] font-medium leading-tight text-white">
            Tutorials
          </h1>
          <button
            type="button"
            onClick={onLinkClick}
            className={`font-sf text-[18px] ${linkColorClass}`}
          >
            {linkLabel}
          </button>
        </div>

        <div className="mt-4 flex w-full max-w-[612px] flex-col gap-3">
          {PARAGRAPHS.map((text, i) => (
            <p key={i} className="font-sf text-[14px] leading-relaxed text-white">
              {text}
            </p>
          ))}
        </div>

        {/* Tutorial preview — annotated home-screen tour (responsive) */}
        <div className="mt-4 aspect-square w-full max-w-[612px] overflow-hidden rounded-[11px] bg-vyrix-input">
          <img src={tutorialMedia} alt="Vyrix tutorial preview" className="h-full w-full object-contain" />
        </div>
      </section>
    </div>
  )
}
