import { useEffect, useState, useRef } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import api from '../api/axios'
import Sidebar from '../components/home/Sidebar'
import Navbar from '../components/home/Navbar'
import SaveIndicator from '../components/editor/SaveIndicator'
import AddFilesMenu from '../components/project/AddFilesMenu'
import FlowRepository from '../components/project/FlowRepository'
import FlowRepositoryModal from '../components/project/FlowRepositoryModal'
import DocumentCover from '../components/project/DocumentCover'
import AiChatPanel from '../components/editor/AiChatPanel'
import { getCoverImage } from '../utils/coverImages'
// GRADIENT 1 — subtle blue glow used across pages (top section)
import headerGlow from '../assets/home/header-glow.png'
import aiIcon from '../assets/editor/ai.png'

const SORT_OPTIONS = [
  { key: 'date_created', label: 'Date Created' },
  { key: 'last_edited', label: 'Last Edited' },
  { key: 'name', label: 'Name (A–Z)' },
]

export default function Project() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const source = searchParams.get('source') || 'home'
  const folderName = searchParams.get('folderName') || ''

  const [user, setUser] = useState(null)
  const [doc, setDoc] = useState(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [saveStatus, setSaveStatus] = useState('idle')
  const [sortIndex, setSortIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [isTodoOpen, setIsTodoOpen] = useState(false)
  const [showAddMenu, setShowAddMenu] = useState(false)
  const [showLinkInput, setShowLinkInput] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const [devToast, setDevToast] = useState(false)
  const [flowModalOpen, setFlowModalOpen] = useState(false)
  const [aiOpen, setAiOpen] = useState(false)
  const saveTimerRef = useRef(null)
  const descTimerRef = useRef(null)
  const addButtonRef = useRef(null)

  useEffect(() => {
    let active = true
    Promise.all([api.get('/api/auth/me'), api.get(`/api/docs/${id}`)])
      .then(([userRes, docRes]) => {
        if (!active) return
        setUser(userRes.data.user)
        setDoc(docRes.data.doc)
        setTitle(docRes.data.doc.title || 'Untitled')
        setDescription(docRes.data.doc.description || '')
        setLoading(false)
      })
      .catch((err) => {
        if (!active) return
        if (err.response?.status === 401 || err.response?.status === 403) navigate('/login')
        else navigate('/home')
      })
    return () => {
      active = false
    }
  }, [id, navigate])

  // Save title (debounced)
  const saveTitle = (newTitle) => {
    const trimmed = newTitle.trim() || 'Untitled'
    if (trimmed === doc?.title) return
    setSaveStatus('saving')
    clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(async () => {
      try {
        await api.patch(`/api/docs/${id}`, { title: trimmed })
        setDoc((prev) => ({ ...prev, title: trimmed }))
        setSaveStatus('saved')
        setTimeout(() => setSaveStatus('idle'), 2000)
      } catch {
        setSaveStatus('idle')
      }
    }, 800)
  }

  // Save description (debounced)
  const saveDescription = (value) => {
    clearTimeout(descTimerRef.current)
    descTimerRef.current = setTimeout(async () => {
      try {
        await api.patch(`/api/docs/${id}/description`, { description: value })
      } catch (err) {
        console.error('Failed to save description:', err)
      }
    }, 1000)
  }

  // Clear pending timers on unmount.
  useEffect(() => {
    return () => {
      clearTimeout(saveTimerRef.current)
      clearTimeout(descTimerRef.current)
    }
  }, [])

  const sortedAttachments = [...(doc?.attachments || [])].sort((a, b) => {
    const key = SORT_OPTIONS[sortIndex].key
    if (key === 'name') return (a.name || '').localeCompare(b.name || '')
    if (key === 'last_edited')
      return new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)
    return new Date(b.createdAt) - new Date(a.createdAt)
  })

  // Create a TipTap document, attach it to this project, go to the editor.
  const handleCreateDocument = async () => {
    try {
      const { data } = await api.post('/api/docs')
      await api.post(`/api/docs/${id}/attachments`, {
        type: 'document',
        name: 'Untitled',
        url: `/doc/${data.doc._id}`,
        docId: data.doc._id,
      })
      const updated = await api.get(`/api/docs/${id}`)
      setDoc(updated.data.doc)
      navigate(`/doc/${data.doc._id}?projectId=${id}`)
    } catch (err) {
      console.error('Failed to create document:', err)
    }
  }

  // Add a URL link as an attachment.
  const handleAddLink = async () => {
    const url = linkUrl.trim()
    if (!url) return
    try {
      const { data } = await api.post(`/api/docs/${id}/attachments`, {
        type: 'link',
        name: url,
        url,
      })
      setDoc((prev) => ({
        ...prev,
        attachments: [...(prev.attachments || []), data.attachment],
      }))
      setLinkUrl('')
      setShowLinkInput(false)
    } catch (err) {
      console.error('Failed to add link:', err)
    }
  }

  // Upload a local file as an attachment.
  const handleAddFile = async (file) => {
    try {
      const formData = new FormData()
      formData.append('file', file)
      const { data } = await api.post(`/api/docs/${id}/attachments`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setDoc((prev) => ({
        ...prev,
        attachments: [...(prev.attachments || []), data.attachment],
      }))
    } catch (err) {
      console.error('Failed to upload file:', err)
    }
  }

  // External tools — "In Development" toast.
  const showDevToast = () => {
    setDevToast(true)
    setTimeout(() => setDevToast(false), 2500)
  }

  // The Flow Repository overlay reports the full updated flows list back.
  const handleFlowsChange = (flows) => {
    setDoc((prev) => ({ ...prev, flows }))
  }

  // Breadcrumb config
  const breadcrumb =
    {
      home: { label: 'Home', path: '/home' },
      allfiles: { label: 'All files', path: '/all-files' },
      folder: { label: folderName || 'Folder', path: -1 }, // -1 = go back
    }[source] || { label: 'Home', path: '/home' }

  const activePageMap = { home: 'home', allfiles: 'allfiles', folder: 'home' }

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-black">
        <p className="font-unbounded text-lg text-[#d5d5d5]">Loading...</p>
      </div>
    )
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-black">
      <Sidebar user={user} activePage={activePageMap[source] || 'home'} />

      <div className="relative flex flex-1 flex-col overflow-hidden">
        <Navbar
          onToggleTodo={() => setIsTodoOpen((v) => !v)}
          isTodoOpen={isTodoOpen}
          activeTabTitle={title}
        />

        <div className="relative flex-1 overflow-hidden">
        <div className="absolute inset-0 overflow-y-auto px-[39px] pb-12 pt-8">
          {/* GRADIENT 1 — subtle blue glow behind the top section */}
          <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 z-0 select-none">
            <img
              src={headerGlow}
              alt=""
              className="h-[620px] w-full object-cover opacity-50"
              style={{
                maskImage: 'linear-gradient(to bottom, black 30%, transparent 75%)',
                WebkitMaskImage: 'linear-gradient(to bottom, black 30%, transparent 75%)',
              }}
            />
            {/* Whitish glow behind the top-right, around the Flow Repository box */}
            <div
              className="absolute right-0 top-0 h-[460px] w-[860px]"
              style={{
                background:
                  'radial-gradient(55% 62% at 74% 16%, rgba(222,230,255,0.18), rgba(222,230,255,0.06) 46%, transparent 72%)',
              }}
            />
          </div>

          {/* Content above the glow */}
          <div className="relative z-10">
          {/* TOP ROW — left (title/description) + right (Flow Repository) */}
          <div className="flex gap-8">
            {/* LEFT — breadcrumb / title / description */}
            <div className="min-w-0 flex-1">
              {/* Breadcrumb */}
              <div className="mb-4 flex items-center gap-2">
                <button
                  onClick={() =>
                    breadcrumb.path === -1 ? navigate(-1) : navigate(breadcrumb.path)
                  }
                  className="cursor-pointer text-[16px] font-[590] text-[#8d8d97] transition-colors hover:text-white"
                >
                  {breadcrumb.label}
                </button>
                <span className="text-[16px] text-[#8d8d97]">›</span>
                <span className="text-[16px] font-[590] text-[#d5d5d5]">{title}</span>
              </div>

              {/* Cover icon + Title + Save indicator */}
              <div className="mb-6 flex items-start gap-4">
                <img
                  src={getCoverImage(doc?.coverIndex)}
                  alt=""
                  className="mt-1 h-[62px] w-[62px] flex-shrink-0 rounded-[11px] object-cover"
                />
                <div className="min-w-0 flex-1">
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value)
                      saveTitle(e.target.value)
                    }}
                    onBlur={(e) => saveTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') e.target.blur()
                    }}
                    placeholder="Untitled"
                    maxLength={100}
                    className="w-full border-none bg-transparent font-unbounded text-[38px] font-medium leading-tight text-white outline-none placeholder:text-[#4a4a5a]"
                  />
                  <div className="mt-1">
                    <SaveIndicator status={saveStatus} />
                  </div>
                </div>
              </div>

              {/* Description section */}
              <div className="mt-2">
                <p className="mb-2 text-[16px] font-[590] text-[#d5d5d5]">Description</p>
                <textarea
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value)
                    saveDescription(e.target.value)
                    // Auto-grow
                    e.target.style.height = 'auto'
                    e.target.style.height = e.target.scrollHeight + 'px'
                  }}
                  onBlur={(e) => saveDescription(e.target.value)}
                  placeholder="Enter Description..."
                  rows={3}
                  className="w-full resize-none overflow-hidden border-none bg-transparent text-[15px] leading-[1.6] text-[#d5d5d5] outline-none placeholder:text-[#4a4a5a]"
                  style={{ minHeight: '72px' }}
                />
              </div>

              </div>

            {/* RIGHT — Flow Repository box (top-right) */}
            <div className="w-[46%] max-w-[725px] shrink-0">
              <FlowRepository
                flows={doc?.flows || []}
                onOpen={() => setFlowModalOpen(true)}
              />
            </div>
          </div>

          {/* Full-width divider — thin gradient hairline (fades at the ends) */}
          <div className="my-7 h-px w-full bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.16)] to-transparent" />

          {/* Documents section — full width */}
          <div>
                {/* Header row: Documents + Sort By (left), Add files (right) */}
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <p className="text-[20px] font-[590] text-[#d5d5d5]">Documents</p>

                    {/* Sort By pill */}
                    <button
                      onClick={() => setSortIndex((i) => (i + 1) % SORT_OPTIONS.length)}
                      className="flex cursor-pointer items-center gap-2 rounded-[15px] border border-[#a6a6a6] bg-[rgba(14,16,34,0.62)] px-3 py-[2px] transition-colors hover:border-[#b2c5f2]"
                    >
                      <span className="text-[14px] text-[#8d8d97]">Sort By</span>
                      <span className="flex items-center gap-1 text-[13px] text-white">
                        {SORT_OPTIONS[sortIndex].label}
                        <svg width="8" height="5" viewBox="0 0 8 5" fill="none">
                          <path d="M1 1l3 3 3-3" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
                        </svg>
                      </span>
                    </button>
                  </div>

                  {/* Add files — bare + icon with label below, right aligned */}
                  <div className="relative flex flex-col items-center" ref={addButtonRef}>
                    <button
                      onClick={() => setShowAddMenu((v) => !v)}
                      className="flex h-[39px] w-[108px] cursor-pointer items-center justify-center"
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M12 4v16M4 12h16" stroke="#cfcfdc" strokeWidth="1.6" strokeLinecap="round" />
                      </svg>
                    </button>
                    <span className="font-sf text-[14.9px] font-bold text-[#cfcfdc]">Add files</span>

                    {showAddMenu && (
                      <AddFilesMenu
                        onCreateDocument={handleCreateDocument}
                        onAddLink={() => {
                          setShowLinkInput(true)
                          setShowAddMenu(false)
                        }}
                        onAddFile={handleAddFile}
                        onCanva={() => {
                          window.open('https://www.canva.com', '_blank')
                          showDevToast()
                        }}
                        onFigma={() => {
                          window.open('https://www.figma.com', '_blank')
                          showDevToast()
                        }}
                        onClose={() => setShowAddMenu(false)}
                      />
                    )}
                  </div>
                </div>

                {/* Attachments grid or empty state */}
                {sortedAttachments.length === 0 ? (
                  <div className="flex h-[260px] items-center justify-center">
                    <p className="text-[15px] text-[#4a4a5a]">No Documents yet..</p>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-[18px]">
                    {sortedAttachments.map((att) => (
                      <div
                        key={att.id || att._id}
                        className="group flex w-[200px] cursor-pointer flex-col gap-2"
                        onClick={() =>
                          att.type === 'document' &&
                          att.docId &&
                          navigate(`/doc/${att.docId}?projectId=${id}`)
                        }
                      >
                        {/* Thumbnail */}
                        <div className="relative h-[130px] w-full transition-transform group-hover:-translate-y-0.5">
                          <DocumentCover att={att} />
                          {/* expand-arrows icon top-right (Figma 130:1377) */}
                          <div className="absolute right-2 top-2 flex h-[26px] w-[26px] items-center justify-center rounded-[7px] bg-[rgba(8,9,20,0.5)] opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="15 3 21 3 21 9" />
                              <polyline points="9 21 3 21 3 15" />
                              <line x1="21" y1="3" x2="14" y2="10" />
                              <line x1="3" y1="21" x2="10" y2="14" />
                            </svg>
                          </div>
                        </div>
                        {/* Name */}
                        <p className="truncate text-[14px] font-[510] text-[#d5d5d5]">{att.name || 'Untitled'}</p>
                        <p className="text-[11px] capitalize text-[#8d8d97]">{att.type}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Inline link input */}
                {showLinkInput && (
                  <div className="mt-3 flex items-center gap-3">
                    <input
                      autoFocus
                      type="url"
                      value={linkUrl}
                      onChange={(e) => setLinkUrl(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAddLink()
                        if (e.key === 'Escape') {
                          setShowLinkInput(false)
                          setLinkUrl('')
                        }
                      }}
                      onBlur={() => {
                        if (!linkUrl.trim()) setShowLinkInput(false)
                      }}
                      placeholder="https://..."
                      className="max-w-[400px] flex-1 rounded-[9px] border border-[rgba(178,197,242,0.3)] bg-[rgba(255,255,255,0.05)] px-4 py-2 text-[14px] text-white outline-none placeholder:text-[#4a4a5a]"
                    />
                    <button
                      onClick={handleAddLink}
                      className="cursor-pointer rounded-[9px] bg-[#b2c5f2] px-4 py-2 text-[13px] font-bold text-black transition-colors hover:bg-[#c5d4f5]"
                    >
                      Add
                    </button>
                    <button
                      onClick={() => {
                        setShowLinkInput(false)
                        setLinkUrl('')
                      }}
                      className="cursor-pointer text-[13px] text-[#8d8d97] transition-colors hover:text-white"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
          </div>
        </div>

          {/* AI chat — glassmorphic overlay sliding in from the right (Figma 288:2234) */}
          {aiOpen && (
            <div className="absolute inset-y-0 right-0 z-50 w-[460px] max-w-[92%]">
              <AiChatPanel glass onClose={() => setAiOpen(false)} />
            </div>
          )}
        </div>
      </div>

      {/* Floating AI button — opens the project AI assistant (hidden while open) */}
      {!aiOpen && (
        <button
          type="button"
          title="AI Assistant"
          onClick={() => setAiOpen(true)}
          className="fixed bottom-7 right-8 z-40 flex h-[64px] w-[64px] cursor-pointer items-center justify-center rounded-[18px] border border-[rgba(178,197,242,0.2)] bg-[#0e1022] shadow-[0px_10px_30px_rgba(0,0,0,0.45)] transition-transform hover:scale-105"
        >
          <img src={aiIcon} alt="AI" className="h-[34px] w-[34px]" />
        </button>
      )}

      {/* In Development toast */}
      {devToast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-[11px] border border-[rgba(178,197,242,0.32)] bg-[rgba(20,24,46,0.95)] px-5 py-3 shadow-lg">
          <span className="text-[13px] font-bold text-[#b2c5f2]">
            In Development — coming soon
          </span>
        </div>
      )}

      {/* Flow Repository overlay */}
      <FlowRepositoryModal
        isOpen={flowModalOpen}
        onClose={() => setFlowModalOpen(false)}
        projectId={id}
        flows={doc?.flows || []}
        onFlowsChange={handleFlowsChange}
      />
    </div>
  )
}
