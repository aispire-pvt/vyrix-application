import { useNavigate } from 'react-router-dom'
import TutorialsLayout from '../components/onboarding/TutorialsLayout'

export default function Tutorials() {
  const navigate = useNavigate()

  return (
    <TutorialsLayout
      linkLabel="Skip"
      linkColorClass="text-[#a3a3a3]"
      // Skip the tutorial — placeholder advances to the next slide until the app home exists.
      onLinkClick={() => navigate('/tutorials/next')}
    />
  )
}
