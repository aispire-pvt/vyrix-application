import { useNavigate } from 'react-router-dom'
import TutorialsLayout from '../components/onboarding/TutorialsLayout'

export default function TutorialsNext() {
  const navigate = useNavigate()

  return (
    <TutorialsLayout
      linkLabel="Next"
      linkColorClass="text-vyrix-link-purple"
      // Final tutorial slide — advance to the app home.
      onLinkClick={() => navigate('/home')}
    />
  )
}
