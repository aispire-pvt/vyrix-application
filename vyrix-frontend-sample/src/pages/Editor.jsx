import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../api/axios'
import Sidebar from '../components/home/Sidebar'
import Navbar from '../components/home/Navbar'
import SaveIndicator from '../components/editor/SaveIndicator'
import TipTapEditor from '../components/editor/TipTapEditor'
import EditorToolbar from '../components/editor/EditorToolbar'

export default function Editor() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [user, setUser] = useState(null)
  const [doc, setDoc] = useState(null)
  const [title, setTitle] = useState('')
  const [saveStatus, setSaveStatus] = useState('idle') // 'idle' | 'saving' | 'saved'
  const [loading, setLoading] = useState(true)
  const [isTodoOpen, setIsTodoOpen] = useState(false)
  const [editorInstance, setEditorInstance] = useState(null)
  const saveTimerRef = useRef(null)

  // Load user + doc in parallel
  useEffect(() => {
    let active = true
    Promise.all([api.get('/api/auth/me'), api.get(`/api/docs/${id}`)])
      .then(([userRes, docRes]) => {
        if (!active) return
        setUser(userRes.data.user)
        setDoc(docRes.data.doc)
        setTitle(docRes.data.doc.title || 'Untitled')
        setLoading(false)
      })
      .catch((err) => {
        if (!active) return
        if (err.response?.status === 401 || err.response?.status === 403) {
          navigate('/login')
        } else {
          navigate('/home')
        }
      })
    return () => {
      active = false
    }
  }, [id, navigate])

  // Save title to backend
  const saveTitle = async (newTitle) => {
    const trimmed = newTitle.trim() || 'Untitled'
    if (trimmed === doc?.title) return // no change
    setSaveStatus('saving')
    try {
      await api.patch(`/api/docs/${id}`, { title: trimmed })
      setDoc((prev) => ({ ...prev, title: trimmed }))
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 2000)
    } catch (err) {
      console.error('Failed to save title:', err)
      setSaveStatus('idle')
    }
  }

  const handleTitleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      e.target.blur()
    }
  }

  // Debounced content auto-save — 1500ms after the last keystroke
  const handleContentChange = (json) => {
    setSaveStatus('saving')
    clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(async () => {
      try {
        await api.patch(`/api/docs/${id}`, { content: json })
        setSaveStatus('saved')
        setTimeout(() => setSaveStatus('idle'), 2000)
      } catch (err) {
        console.error('Auto-save failed:', err)
        setSaveStatus('idle')
      }
    }, 1500)
  }

  // Clean up the pending save timer on unmount
  useEffect(() => {
    return () => clearTimeout(saveTimerRef.current)
  }, [])

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-black">
        <p className="font-unbounded text-lg text-[#d5d5d5]">Loading...</p>
      </div>
    )
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-black">
      <Sidebar user={user} activePage="allfiles" />

      <div className="relative flex flex-1 flex-col overflow-hidden">
        <Navbar
          onToggleTodo={() => setIsTodoOpen((v) => !v)}
          isTodoOpen={isTodoOpen}
          activeTabTitle={title}
        />

        {/* Editor content area */}
        <div className="flex-1 overflow-y-auto">
          {/* Editor formatting toolbar */}
          <EditorToolbar editor={editorInstance} />

          {/* Document area — centered, max-width for readability */}
          <div className="mx-auto w-full max-w-[720px] px-6 pb-32 pt-12">
            {/* Back link */}
            <button
              onClick={() => navigate('/home')}
              className="mb-8 flex cursor-pointer items-center gap-2 text-[13px] text-[#8d8d97] transition-colors hover:text-white"
            >
              ← Back to Home
            </button>

            {/* Save indicator */}
            <div className="mb-4 flex justify-end">
              <SaveIndicator status={saveStatus} />
            </div>

            {/* Editable title */}
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={(e) => saveTitle(e.target.value)}
              onKeyDown={handleTitleKeyDown}
              placeholder="Untitled"
              maxLength={100}
              className="mb-8 w-full border-none bg-transparent font-unbounded text-[32px] font-medium text-white outline-none placeholder:text-[#4a4a5a]"
            />

            {/* TipTap rich text editor */}
            <TipTapEditor
              content={doc?.content}
              onChange={handleContentChange}
              onEditorReady={(ed) => setEditorInstance(ed)}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
