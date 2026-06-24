import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { getMe, projects } from '../api/local'
import Sidebar from '../components/home/Sidebar'
import Navbar from '../components/home/Navbar'
import SaveIndicator from '../components/editor/SaveIndicator'
import TipTapEditor from '../components/editor/TipTapEditor'
import EditorToolbar from '../components/editor/EditorToolbar'
import AiChatPanel from '../components/editor/AiChatPanel'

export default function Editor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const projectId = searchParams.get('projectId')

  const [user, setUser]           = useState(null)
  const [doc, setDoc]             = useState(null)
  const [title, setTitle]         = useState('')
  const [saveStatus, setSaveStatus] = useState('idle')
  const [loading, setLoading]     = useState(true)
  const [isTodoOpen, setIsTodoOpen] = useState(false)
  const [editorInstance, setEditorInstance] = useState(null)
  const [aiOpen, setAiOpen]       = useState(false)
  const saveTimerRef = useRef(null)

  useEffect(() => {
    let active = true
    Promise.all([getMe(), projects.get(id)])
      .then(([userRes, docRow]) => {
        if (!active) return
        if (!userRes.success) { navigate('/login'); return }
        if (!docRow)          { navigate('/home');  return }
        setUser(userRes.user)
        setDoc({ ...docRow, _id: docRow.id })
        setTitle(docRow.title || 'Untitled')
        setLoading(false)
      })
      .catch(() => { if (active) navigate('/login') })
    return () => { active = false }
  }, [id, navigate])

  const saveTitle = async (newTitle) => {
    const trimmed = newTitle.trim() || 'Untitled'
    if (trimmed === doc?.title) return
    setSaveStatus('saving')
    try {
      await projects.save(id, { title: trimmed })
      setDoc((prev) => ({ ...prev, title: trimmed }))
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 2000)
    } catch {
      setSaveStatus('idle')
    }
  }

  const handleContentChange = (json) => {
    setSaveStatus('saving')
    clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(async () => {
      try {
        await projects.save(id, { content: json })
        setSaveStatus('saved')
        setTimeout(() => setSaveStatus('idle'), 2000)
      } catch {
        setSaveStatus('idle')
      }
    }, 1500)
  }

  useEffect(() => () => clearTimeout(saveTimerRef.current), [])

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

        <div className="flex flex-1 flex-col overflow-hidden">
          <EditorToolbar
            editor={editorInstance}
            onAI={() => setAiOpen((v) => !v)}
            aiActive={aiOpen}
          />

          <div className="flex flex-1 overflow-hidden">
            <div className="dark-scroll flex-1 overflow-y-auto">
              <div className="mx-auto w-full max-w-[720px] px-6 pb-32 pt-12">
                <button
                  onClick={() =>
                    navigate(projectId ? `/project/${projectId}?source=home` : '/home')
                  }
                  className="mb-8 flex cursor-pointer items-center gap-2 text-[13px] text-[#8d8d97] transition-colors hover:text-white"
                >
                  ← {projectId ? 'Back to Project' : 'Back to Home'}
                </button>

                <div className="mb-4 flex justify-end">
                  <SaveIndicator status={saveStatus} />
                </div>

                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onBlur={(e) => saveTitle(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') e.target.blur() }}
                  placeholder="Untitled"
                  maxLength={100}
                  className="mb-8 w-full border-none bg-transparent font-unbounded text-[32px] font-medium text-white outline-none placeholder:text-[#4a4a5a]"
                />

                <TipTapEditor
                  content={doc?.content}
                  onChange={handleContentChange}
                  onEditorReady={(ed) => setEditorInstance(ed)}
                />
              </div>
            </div>

            {aiOpen && <AiChatPanel onClose={() => setAiOpen(false)} />}
          </div>
        </div>
      </div>
    </div>
  )
}
