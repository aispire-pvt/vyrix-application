import { useEffect, useState, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getMe, projects, flows as flowsApi } from '../api/local'
import Sidebar from '../components/home/Sidebar'
import Navbar from '../components/home/Navbar'
import TodoPanel from '../components/home/TodoPanel'

export default function FlowView() {
  const { id, flowId } = useParams()
  const navigate = useNavigate()

  const [user, setUser]     = useState(null)
  const [flow, setFlow]     = useState(null)
  const [loading, setLoading] = useState(true)
  const [isTodoOpen, setIsTodoOpen] = useState(false)
  const [showAddMenu, setShowAddMenu] = useState(false)
  const [showLinkInput, setShowLinkInput] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const fileInputRef = useRef(null)

  useEffect(() => {
    let active = true
    Promise.all([getMe(), projects.get(id)])
      .then(([userRes, docRow]) => {
        if (!active) return
        if (!userRes.success) { navigate('/login'); return }
        if (!docRow)          { navigate('/home');  return }
        setUser(userRes.user)
        const foundFlow = (docRow.flows || []).find((f) => f.id === flowId)
        if (!foundFlow) { navigate(`/project/${id}`); return }
        setFlow(foundFlow)
        setLoading(false)
      })
      .catch(() => { if (active) navigate('/login') })
    return () => { active = false }
  }, [id, flowId, navigate])

  const handleAddLink = async () => {
    const url = linkUrl.trim()
    if (!url) return
    try {
      const file = await flowsApi.addLink(id, flowId, { type: 'link', name: url, url })
      setFlow((prev) => ({ ...prev, files: [...(prev.files || []), file] }))
      setLinkUrl('')
      setShowLinkInput(false)
    } catch (err) { console.error('Failed to add link:', err) }
  }

  const handleAddFile = async (file) => {
    try {
      const sourcePath = file.path
      if (!sourcePath) return
      const added = await flowsApi.addFile(id, flowId, sourcePath, { name: file.name })
      setFlow((prev) => ({ ...prev, files: [...(prev.files || []), added] }))
    } catch (err) { console.error('Failed to add file to flow:', err) }
  }

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-black">
        <p className="font-unbounded text-lg text-[#d5d5d5]">Loading...</p>
      </div>
    )
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-black">
      <Sidebar user={user} activePage="home" />

      <div className="relative flex flex-1 flex-col overflow-hidden">
        <Navbar onToggleTodo={() => setIsTodoOpen((v) => !v)} isTodoOpen={isTodoOpen} />

        <div className="flex-1 overflow-y-auto px-[39px] pb-12 pt-8">
          <div className="mb-6 flex items-center gap-2">
            <button onClick={() => navigate(`/project/${id}`)} className="cursor-pointer text-[15px] font-[590] text-[#8d8d97] transition-colors hover:text-white">Flow Repository</button>
            <span className="text-[15px] text-[#8d8d97]">›</span>
            <span className="text-[15px] font-[590] text-[#d5d5d5]">{flow?.name}</span>
          </div>

          <p className="mb-2 font-unbounded text-[32px] font-medium text-white">{flow?.name}</p>
          <p className="mb-8 text-[13px] text-[#8d8d97]">Files uploaded to this flow</p>
          <div className="mb-8 h-[1px] w-full bg-[rgba(255,255,255,0.06)]" />

          {!flow?.files || flow.files.length === 0 ? (
            <div className="flex h-[150px] items-center justify-center rounded-[20px] border border-dashed border-[rgba(178,197,242,0.15)]">
              <div className="flex flex-col items-center gap-2">
                <p className="text-[14px] text-[#4a4a5a]">No files in this flow yet</p>
                <p className="text-[12px] text-[#3a3a4a]">Use "Add Files" below to upload</p>
              </div>
            </div>
          ) : (
            <div className="mb-8 flex flex-wrap gap-[18px]">
              {flow.files.map((file) => (
                <div
                  key={file.id}
                  onClick={() => (file.localPath || file.url) && window.vyrix.openFile(file)}
                  className="group flex cursor-pointer flex-col gap-2"
                >
                  <div className="flex h-[130px] w-[200px] items-center justify-center overflow-hidden rounded-[16px] border border-[rgba(255,255,255,0.06)] bg-[#111118] transition-colors group-hover:border-[rgba(178,197,242,0.3)]">
                    {file.type === 'link' ? (
                      <div className="flex flex-col items-center gap-2 opacity-70">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#b2c5f2" strokeWidth="1.5">
                          <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
                          <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
                        </svg>
                        <p className="max-w-[160px] truncate px-2 text-[10px] text-[#8d8d97]">{file.url}</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2 opacity-70">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#b2c5f2" strokeWidth="1.5">
                          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                          <polyline points="14 2 14 8 20 8" />
                        </svg>
                        <p className="text-[11px] text-[#8d8d97]">{file.type?.toUpperCase() || 'FILE'}</p>
                      </div>
                    )}
                  </div>
                  <p className="max-w-[200px] truncate text-[14px] font-[510] text-[#d5d5d5]">{file.name}</p>
                  <p className="text-[11px] capitalize text-[#8d8d97]">{file.type}</p>
                </div>
              ))}
            </div>
          )}

          <div className="relative">
            <button onClick={() => setShowAddMenu((v) => !v)} className="flex h-[39px] cursor-pointer items-center gap-2 rounded-[9px] border border-[rgba(178,197,242,0.3)] bg-transparent px-4 text-[13px] text-[#b2c5f2] transition-colors hover:border-[#b2c5f2]">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1v10M1 6h10" stroke="#b2c5f2" strokeWidth="1.5" strokeLinecap="round" /></svg>
              Add Files
            </button>

            {showAddMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowAddMenu(false)} />
                <div className="absolute z-50 mt-2 w-[260px] overflow-hidden rounded-[13px] border border-[rgba(150,150,165,0.3)] bg-[#0e0e1a] shadow-[0px_20px_60px_rgba(0,0,0,0.6)]">
                  <button onClick={() => { fileInputRef.current?.click(); setShowAddMenu(false) }} className="flex w-full cursor-pointer items-center justify-between px-5 py-3 text-[15px] text-white transition-colors hover:bg-[rgba(255,255,255,0.06)]">Add file from Computer</button>
                  <div className="h-[1px] bg-[rgba(255,255,255,0.07)]" />
                  <button onClick={() => { setShowLinkInput(true); setShowAddMenu(false) }} className="flex w-full cursor-pointer items-center justify-between px-5 py-3 text-[15px] text-white transition-colors hover:bg-[rgba(255,255,255,0.06)]">
                    <span>Add a link</span>
                    <span className="text-[13px] text-[#8d8d97] opacity-60">↗</span>
                  </button>
                </div>
              </>
            )}
          </div>

          <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx,.txt,.ppt,.pptx,.xls,.xlsx,.png,.jpg,.jpeg,.gif,.webp" className="hidden"
            onChange={(e) => { if (e.target.files?.[0]) handleAddFile(e.target.files[0]) }}
          />

          {showLinkInput && (
            <div className="mt-4 flex items-center gap-3">
              <input autoFocus type="url" value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleAddLink(); if (e.key === 'Escape') { setShowLinkInput(false); setLinkUrl('') } }}
                onBlur={() => { if (!linkUrl.trim()) setShowLinkInput(false) }}
                placeholder="https://..."
                className="max-w-[400px] flex-1 rounded-[9px] border border-[rgba(178,197,242,0.3)] bg-[rgba(255,255,255,0.05)] px-4 py-2 text-[14px] text-white outline-none placeholder:text-[#4a4a5a]"
              />
              <button onClick={handleAddLink} className="cursor-pointer rounded-[9px] bg-[#b2c5f2] px-4 py-2 text-[13px] font-bold text-black">Add</button>
              <button onClick={() => { setShowLinkInput(false); setLinkUrl('') }} className="cursor-pointer text-[13px] text-[#8d8d97] hover:text-white">Cancel</button>
            </div>
          )}
        </div>

        <TodoPanel
          isOpen={isTodoOpen}
          onClose={() => setIsTodoOpen(false)}
          firstName={user?.firstName}
        />
      </div>
    </div>
  )
}
