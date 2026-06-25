import { useNavigate } from 'react-router-dom'
import TutorialsLayout from '../components/onboarding/TutorialsLayout'

export default function Tutorials() {
  const navigate = useNavigate()

  return (
    <TutorialsLayout
      linkLabel="Skip"
      linkColorClass="text-[#a3a3a3]"
      onLinkClick={() => navigate('/home')}
    />
  )
}
