import { useEffect, useState } from 'react'

// Props: { status } — 'idle' | 'saving' | 'saved'
export default function SaveIndicator({ status }) {
  const [visible, setVisible] = useState(false)
  const [text, setText] = useState('')

  useEffect(() => {
    if (status === 'saving') {
      setText('Saving...')
      setVisible(true)
    } else if (status === 'saved') {
      setText('Saved ✓')
      setVisible(true)
      const t = setTimeout(() => setVisible(false), 2000)
      return () => clearTimeout(t)
    } else {
      setVisible(false)
    }
  }, [status])

  return (
    <span
      className={`text-[12px] text-[#8d8d97] transition-opacity duration-500 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {text}
    </span>
  )
}
