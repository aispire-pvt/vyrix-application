import { useEffect, useState, useRef } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { getMe, projects, attachments as attachmentsApi, flows as flowsApi } from '../api/local'
import Sidebar from '../components/home/Sidebar'
import Navbar from '../components/home/Navbar'
import TodoPanel from '../components/home/TodoPanel'
import SaveIndicator from '../components/editor/SaveIndicator'
import AddFilesMenu from '../components/project/AddFilesMenu'
import FlowRepository from '../components/project/FlowRepository'
import FlowRepositoryModal from '../components/project/FlowRepositoryModal'
import DocumentCover from '../components/project/DocumentCover'
import AiChatPanel from '../components/editor/AiChatPanel'
import { getCoverImage } from '../utils/coverImages'
import headerGlow from '../assets/home/header-glow.png'
import aiIcon from '../assets/editor/ai.png'

const SORT_OPTIONS = [
  { key: 'date_created', label: 'Date Created' },
  { key: 'last_edited',  label: 'Last Edited'  },
  { key: 'name',         label: 'Name (A–Z)'   },
]

export default function Project() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const source     = searchParams.get('source') || 'home'
  const folderName = searchParams.get('folderName') || ''

  const [user, setUser]             = useState(null)
  const [doc, setDoc]               = useState(null)
  const [title, setTitle]           = useState('')
  const [description, setDescription] = useState('')
  const [saveStatus, setSaveStatus] = useState('idle')
  const [sortIndex, setSortIndex]   = useState(0)
  const [loading, setLoading]       = useState(true)
  const [isTodoOpen, setIsTodoOpen] = useState(false)
  const [showAddMenu, setShowAddMenu] = useState(false)
  const [showLinkInput, setShowLinkInput] = useState(false)
  const [linkUrl, setLinkUrl]       = useState('')
  const [externalDialog, setExternalDialog] = useState(null) // { type: 'canva'|'figma', url: '' }
  const [flowModalOpen, setFlowModalOpen] = useState(false)
  const [aiOpen, setAiOpen]         = useState(false)
  const saveTimerRef = useRef(null)
  const descTimerRef = useRef(null)
  const addButtonRef = useRef(null)

  useEffect(() => {
    let active = true
    Promise.all([getMe(), projects.get(id)])
      .then(([userRes, docRow]) => {
        if (!active) return
        if (!userRes.success) { navigate('/login'); return }
        if (!docRow)          { navigate('/home');  return }
        setUser(userRes.user)
        setDoc(docRow)
        setTitle(docRow.title || 'Untitled')
        setDescription(docRow.description || '')
        setLoading(false)
      })
      .catch(() => { if (active) navigate('/login') })
    return () => { active = false }
  }, [id, navigate])

  const saveTitle = (newTitle) => {
    const trimmed = newTitle.trim() || 'Untitled'
    if (trimmed === doc?.title) return
    setSaveStatus('saving')
    clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(async () => {
      try {
        await projects.save(id, { title: trimmed })
        setDoc((prev) => ({ ...prev, title: trimmed }))
        setSaveStatus('saved')
        setTimeout(() => setSaveStatus('idle'), 2000)
      } catch { setSaveStatus('idle') }
    }, 800)
  }

  const saveDescription = (value) => {
    clearTimeout(descTimerRef.current)
    descTimerRef.current = setTimeout(async () => {
      try { await projects.save(id, { description: value }) }
      catch (err) { console.error('Failed to save description:', err) }
    }, 1000)
  }

  useEffect(() => () => {
    clearTimeout(saveTimerRef.current)
    clearTimeout(descTimerRef.current)
  }, [])

  const sortedAttachments = [...(doc?.attachments || [])].sort((a, b) => {
    const key = SORT_OPTIONS[sortIndex].key
    if (key === 'name')        return (a.name || '').localeCompare(b.name || '')
    if (key === 'last_edited') return new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)
    return new Date(b.createdAt) - new Date(a.createdAt)
  })

  // Create a child TipTap doc, attach it as a document-type attachment
  const handleCreateDocument = async () => {
    try {
      const newDoc = await projects.create(id)
      const att = await attachmentsApi.addLink(id, {
        type:  'document',
        name:  'Untitled',
        url:   `/doc/${newDoc.id}`,
        docId: newDoc.id,
      })
      setDoc((prev) => ({ ...prev, attachments: [...(prev.attachments || []), att] }))
      navigate(`/doc/${newDoc.id}?projectId=${id}&attId=${att.id}`)
    } catch (err) { console.error('Failed to create document:', err) }
  }

  const handleAddLink = async () => {
    const url = linkUrl.trim()
    if (!url) return
    try {
      const att = await attachmentsApi.addLink(id, { type: 'link', name: url, url })
      setDoc((prev) => ({ ...prev, attachments: [...(prev.attachments || []), att] }))
      setLinkUrl('')
      setShowLinkInput(false)
    } catch (err) { console.error('Failed to add link:', err) }
  }

  // sourcePath comes from an open-file dialog in renderer via a future dialog IPC call.
  // For now, the AddFilesMenu file picker passes a File object — we use its path (Electron sets it).
  const handleAddFile = async (file) => {
    try {
      const sourcePath = file.path   // Electron exposes file.path on File objects
      if (!sourcePath) return
      const att = await attachmentsApi.add(id, sourcePath, { name: file.name })
      setDoc((prev) => ({ ...prev, attachments: [...(prev.attachments || []), att] }))
    } catch (err) { console.error('Failed to add file:', err) }
  }

  const handleOpenExternal = (type) => {
    const urls = { canva: 'https://www.canva.com', figma: 'https://www.figma.com' }
    window.open(urls[type], '_blank')
    setExternalDialog({ type, url: '' })
  }

  const handleSaveExternalLink = async () => {
    if (!externalDialog?.url?.trim()) return
    try {
      const att = await attachmentsApi.addLink(id, {
        type: externalDialog.type,
        name: externalDialog.url.trim(),
        url:  externalDialog.url.trim(),
      })
      setDoc((prev) => ({ ...prev, attachments: [...(prev.attachments || []), att] }))
      setExternalDialog(null)
    } catch (err) { console.error('Failed to save link:', err) }
  }

  const handleFlowsChange = (flowList) => {
    setDoc((prev) => ({ ...prev, flows: flowList }))
  }

  const breadcrumb = {
    home:     { label: 'Home',      path: '/home' },
    allfiles: { label: 'All files', path: '/all-files' },
    folder:   { label: folderName || 'Folder', path: -1 },
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
            <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 z-0 select-none">
              <img src={headerGlow} alt="" className="h-[620px] w-full object-cover opacity-50"
                style={{ maskImage: 'linear-gradient(to bottom, black 30%, transparent 75%)', WebkitMaskImage: 'linear-gradient(to bottom, black 30%, transparent 75%)' }}
              />
              <div className="absolute right-0 top-0 h-[460px] w-[860px]"
                style={{ background: 'radial-gradient(55% 62% at 74% 16%, rgba(222,230,255,0.18), rgba(222,230,255,0.06) 46%, transparent 72%)' }}
              />
            </div>

            <div className="relative z-10">
              <div className="flex gap-8">
                {/* LEFT */}
                <div className="min-w-0 flex-1">
                  <div className="mb-4 flex items-center gap-2">
                    <button
                      onClick={() => breadcrumb.path === -1 ? navigate(-1) : navigate(breadcrumb.path)}
                      className="cursor-pointer text-[16px] font-[590] text-[#8d8d97] transition-colors hover:text-white"
                    >
                      {breadcrumb.label}
                    </button>
                    <span className="text-[16px] text-[#8d8d97]">›</span>
                    <span className="text-[16px] font-[590] text-[#d5d5d5]">{title}</span>
                  </div>

                  <div className="mb-6 flex items-start gap-4">
                    <img src={getCoverImage(doc?.cover_index)} alt="" className="mt-1 h-[62px] w-[62px] flex-shrink-0 rounded-[11px] object-cover" />
                    <div className="min-w-0 flex-1">
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => { setTitle(e.target.value); saveTitle(e.target.value) }}
                        onBlur={(e) => saveTitle(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') e.target.blur() }}
                        placeholder="Untitled"
                        maxLength={100}
                        className="w-full border-none bg-transparent font-unbounded text-[38px] font-medium leading-tight text-white outline-none placeholder:text-[#4a4a5a]"
                      />
                      <div className="mt-1"><SaveIndicator status={saveStatus} /></div>
                    </div>
                  </div>

                  <div className="mt-2">
                    <p className="mb-2 text-[16px] font-[590] text-[#d5d5d5]">Description</p>
                    <textarea
                      value={description}
                      onChange={(e) => {
                        setDescription(e.target.value)
                        saveDescription(e.target.value)
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

                {/* RIGHT — Flow Repository */}
                <div className="w-[46%] max-w-[725px] shrink-0">
                  <FlowRepository flows={doc?.flows || []} onOpen={() => setFlowModalOpen(true)} />
                </div>
              </div>

              <div className="my-7 h-px w-full bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.16)] to-transparent" />

              {/* Documents section */}
              <div>
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <p className="text-[20px] font-[590] text-[#d5d5d5]">Documents</p>
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
                        onAddLink={() => { setShowLinkInput(true); setShowAddMenu(false) }}
                        onAddFile={handleAddFile}
                        onCanva={() => handleOpenExternal('canva')}
                        onFigma={() => handleOpenExternal('figma')}
                        onClose={() => setShowAddMenu(false)}
                      />
                    )}
                  </div>
                </div>

                {sortedAttachments.length === 0 ? (
                  <div className="flex h-[260px] items-center justify-center">
                    <p className="text-[15px] text-[#4a4a5a]">No Documents yet..</p>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-[18px]">
                    {sortedAttachments.map((att) => (
                      <div
                        key={att.id}
                        className="group flex w-[200px] cursor-pointer flex-col gap-2"
                        onClick={() => {
                          if (att.type === 'document' && att.docId) {
                            navigate(`/doc/${att.docId}?projectId=${id}&attId=${att.id}`)
                          } else if (att.localPath || (typeof att.url === 'string' && att.url.startsWith('local://'))) {
                            // Local file (pdf/image/word/etc.) → open in the OS default app
                            window.vyrix.openFile(att)
                          } else if (att.url) {
                            // Real web link (link/canva/figma) → open in the browser
                            window.open(att.url, '_blank')
                          }
                        }}
                      >
                        <div className="relative h-[130px] w-full transition-transform group-hover:-translate-y-0.5">
                          <DocumentCover att={att} />
                          <div className="absolute right-2 top-2 flex h-[26px] w-[26px] items-center justify-center rounded-[7px] bg-[rgba(8,9,20,0.5)] opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="15 3 21 3 21 9" /><polyline points="9 21 3 21 3 15" />
                              <line x1="21" y1="3" x2="14" y2="10" /><line x1="3" y1="21" x2="10" y2="14" />
                            </svg>
                          </div>
                        </div>
                        <p className="truncate text-[14px] font-[510] text-[#d5d5d5]">{att.name || 'Untitled'}</p>
                        <p className="text-[11px] capitalize text-[#8d8d97]">{att.type}</p>
                      </div>
                    ))}
                  </div>
                )}

                {showLinkInput && (
                  <div className="mt-3 flex items-center gap-3">
                    <input
                      autoFocus
                      type="url"
                      value={linkUrl}
                      onChange={(e) => setLinkUrl(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAddLink()
                        if (e.key === 'Escape') { setShowLinkInput(false); setLinkUrl('') }
                      }}
                      onBlur={() => { if (!linkUrl.trim()) setShowLinkInput(false) }}
                      placeholder="https://..."
                      className="max-w-[400px] flex-1 rounded-[9px] border border-[rgba(178,197,242,0.3)] bg-[rgba(255,255,255,0.05)] px-4 py-2 text-[14px] text-white outline-none placeholder:text-[#4a4a5a]"
                    />
                    <button onClick={handleAddLink} className="cursor-pointer rounded-[9px] bg-[#b2c5f2] px-4 py-2 text-[13px] font-bold text-black transition-colors hover:bg-[#c5d4f5]">Add</button>
                    <button onClick={() => { setShowLinkInput(false); setLinkUrl('') }} className="cursor-pointer text-[13px] text-[#8d8d97] transition-colors hover:text-white">Cancel</button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {aiOpen && (
            <div className="absolute inset-y-0 right-0 z-50 w-[460px] max-w-[92%]">
              <AiChatPanel glass onClose={() => setAiOpen(false)} />
            </div>
          )}
        </div>

        <TodoPanel
          isOpen={isTodoOpen}
          onClose={() => setIsTodoOpen(false)}
          firstName={user?.firstName}
        />
      </div>

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

      {externalDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-[420px] rounded-[20px] border border-[rgba(178,197,242,0.2)] bg-[#0e1022] p-7 shadow-2xl">
            <h3 className="mb-1 font-unbounded text-[18px] font-medium text-white capitalize">
              {externalDialog.type} Link
            </h3>
            <p className="mb-5 font-sf text-[13px] text-[#8d8d97]">
              {externalDialog.type === 'canva' ? 'Canva' : 'Figma'} has opened in your browser. Create or open your file, copy its share link, then paste it below.
            </p>
            <input
              autoFocus
              type="url"
              placeholder={externalDialog.type === 'canva' ? 'https://www.canva.com/design/...' : 'https://www.figma.com/file/...'}
              value={externalDialog.url}
              onChange={(e) => setExternalDialog((d) => ({ ...d, url: e.target.value }))}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSaveExternalLink(); if (e.key === 'Escape') setExternalDialog(null) }}
              className="w-full rounded-[10px] border border-[rgba(178,197,242,0.3)] bg-[rgba(255,255,255,0.05)] px-4 py-3 text-[14px] text-white outline-none placeholder:text-[#4a4a5a] focus:border-[rgba(178,197,242,0.6)]"
            />
            <div className="mt-5 flex justify-end gap-3">
              <button onClick={() => setExternalDialog(null)} className="cursor-pointer rounded-[10px] px-4 py-2 text-[13px] text-[#8d8d97] transition-colors hover:text-white">
                Cancel
              </button>
              <button onClick={handleSaveExternalLink} className="cursor-pointer rounded-[10px] bg-[#b2c5f2] px-5 py-2 text-[13px] font-bold text-black transition-colors hover:bg-[#c5d4f5]">
                Save Link
              </button>
            </div>
          </div>
        </div>
      )}

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
