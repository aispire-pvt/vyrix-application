import OnboardingSidebar from './OnboardingSidebar'

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
    <div className="flex min-h-screen w-full items-stretch gap-8 bg-black p-7">
      {/* Left panel — all 3 steps active */}
      <OnboardingSidebar activeStep={3} />

      {/* Right panel — tutorial content */}
      <section className="flex flex-1 flex-col px-12 py-10">
        <div className="flex w-full items-start justify-between">
          <h1 className="font-unbounded text-[40px] font-medium leading-tight text-white">
            Tutorials
          </h1>
          <button
            type="button"
            onClick={onLinkClick}
            className={`font-sf text-[20px] ${linkColorClass}`}
          >
            {linkLabel}
          </button>
        </div>

        <div className="mt-6 flex w-[612px] max-w-full flex-col gap-4">
          {PARAGRAPHS.map((text, i) => (
            <p key={i} className="font-sf text-[16px] leading-relaxed text-white">
              {text}
            </p>
          ))}
        </div>

        {/* Tutorial media — swap src once tutorials-bg.png is added to src/assets/ */}
        <div className="mt-6 h-[589px] w-[612px] max-w-full overflow-hidden rounded-[11px] bg-vyrix-input">
          {typeof tutorialsBgUrl !== 'undefined' && (
            <img src={tutorialsBgUrl} alt="Vyrix tutorials" className="h-full w-full object-cover" />
          )}
        </div>
      </section>
    </div>
  )
}
