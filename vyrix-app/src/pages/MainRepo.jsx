import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMe, projects } from '../api/local'
import Sidebar from '../components/home/Sidebar'
import Navbar from '../components/home/Navbar'
import TodoPanel from '../components/home/TodoPanel'
import FileTypeIcon from '../components/project/FileTypeIcon'
import { getCoverImage } from '../utils/coverImages'

const SORT_OPTIONS = [
  { key: 'date_created', label: 'Date Created' },
  { key: 'last_edited',  label: 'Last Edited'  },
  { key: 'name',         label: 'Name (A–Z)'   },
]

export default function MainRepo() {
  const navigate = useNavigate()

  const [user, setUser]     = useState(null)
  const [docs, setDocs]     = useState([])
  const [loading, setLoading] = useState(true)
  const [isTodoOpen, setIsTodoOpen] = useState(false)
  const [sortIndex, setSortIndex] = useState(0)
  const [showFolders, setShowFolders] = useState(false)
  const [selectedProjectId, setSelectedProjectId] = useState(null)

  useEffect(() => {
    let active = true
    Promise.all([getMe(), projects.listFull()])
      .then(([userRes, docRows]) => {
        if (!active) return
        if (!userRes.success) { navigate('/login'); return }
        setUser(userRes.user)
        setDocs(docRows)
        setLoading(false)
      })
      .catch(() => { if (active) navigate('/login') })
    return () => { active = false }
  }, [navigate])

  const sortedDocs = [...docs].sort((a, b) => {
    const key = SORT_OPTIONS[sortIndex].key
    if (key === 'name')        return (a.title || '').localeCompare(b.title || '')
    if (key === 'last_edited') return new Date(b.updated_at) - new Date(a.updated_at)
    return new Date(b.created_at) - new Date(a.created_at)
  })

  const filesOf = (doc) => [
    ...(doc?.attachments || []),
    ...(doc?.flows || []).flatMap((f) => f.files || []),
  ]

  const selectedDoc = selectedProjectId ? docs.find((d) => d.id === selectedProjectId) : null
  const shownFiles  = (selectedDoc ? filesOf(selectedDoc) : docs.flatMap(filesOf))
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))

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
        <Navbar onToggleTodo={() => setIsTodoOpen((v) => !v)} isTodoOpen={isTodoOpen} activeTabTitle="Repository" />

        <div className="dark-scroll flex-1 overflow-y-auto px-[39px] pb-12 pt-8">
          <div className="mb-6 flex items-start justify-between">
            <h1 className="font-unbounded text-[40px] font-medium text-[#e7e7e7]">Project Based Repo</h1>
            <button onClick={() => navigate('/all-files')} className="flex h-[74px] cursor-pointer items-center gap-3 rounded-[20px] bg-[rgba(12,12,24,0.27)] px-5 shadow-[0px_4px_7.6px_-3px_rgba(255,255,255,0.24)] transition-colors hover:bg-[rgba(12,12,24,0.5)]">
              <svg width="22" height="18" viewBox="0 0 22 18" fill="none" className="opacity-80"><path d="M1 3a2 2 0 012-2h4l2 2h10a2 2 0 012 2v10a2 2 0 01-2 2H3a2 2 0 01-2-2V3z" stroke="#d5d5d5" strokeWidth="1.5" /></svg>
              <span className="text-[20px] font-bold text-[#d5d5d5]">Go to your projects</span>
            </button>
          </div>

          <div className="mb-6 flex items-center gap-4">
            <button onClick={() => setSortIndex((i) => (i + 1) % SORT_OPTIONS.length)} className="flex cursor-pointer items-center gap-2 rounded-[15px] border border-[#a6a6a6] bg-[rgba(14,16,34,0.62)] px-4 py-1 transition-colors hover:border-[#b2c5f2]">
              <span className="text-[20px] font-[510] text-white">Sort By</span>
              <span className="flex items-center gap-1 text-[15px] text-white">
                {SORT_OPTIONS[sortIndex].label}
                <svg width="8" height="5" viewBox="0 0 8 5" fill="none"><path d="M1 1l3 3 3-3" stroke="white" strokeWidth="1.2" strokeLinecap="round" /></svg>
              </span>
            </button>
            <button onClick={() => setShowFolders((v) => !v)} className="flex cursor-pointer items-center gap-2 rounded-[15px] border border-[#a6a6a6] bg-[rgba(14,16,34,0.62)] px-4 py-[3px] transition-colors hover:border-[#b2c5f2]">
              <span className="text-[14px] text-[#d5d5d5]">Show Folders</span>
              <div className={`flex h-[17px] w-[17px] items-center justify-center rounded-[4px] border-2 ${showFolders ? 'border-[#b2c5f2] bg-[#b2c5f2]' : 'border-[#5a5a6e]'}`}>
                {showFolders && <svg width="9" height="9" viewBox="0 0 9 9" fill="none"><path d="M1.5 4.5l2 2 4-4" stroke="black" strokeWidth="1.5" strokeLinecap="round" /></svg>}
              </div>
            </button>
          </div>

          <div className="mb-4 flex items-center gap-3">
            <p className="text-[20px] font-[590] text-[#d5d5d5]">Projects</p>
            <span className="text-[13px] text-[#6a6a7a]">— click a project to see only its files</span>
          </div>

          {docs.length === 0 ? (
            <div className="mb-8 flex h-[120px] items-center justify-center rounded-[20px] border border-dashed border-[rgba(178,197,242,0.15)]">
              <p className="text-[14px] text-[#4a4a5a]">No projects yet</p>
            </div>
          ) : (
            <div className="mb-8 flex flex-wrap gap-[18px]">
              {sortedDocs.map((doc) => {
                const selected = doc.id === selectedProjectId
                return (
                  <div key={doc.id} onClick={() => setSelectedProjectId(selected ? null : doc.id)} className="group flex cursor-pointer flex-col gap-2">
                    <div className={`relative h-[164px] w-[266px] overflow-hidden rounded-[20px] shadow-[0px_4px_4.5px_2px_rgba(0,0,0,0.25)] transition-all group-hover:-translate-y-0.5 ${selected ? 'ring-2 ring-[#b2c5f2] ring-offset-2 ring-offset-black' : ''}`}>
                      <img src={getCoverImage(doc.cover_index)} alt="" className="absolute inset-0 h-full w-full object-cover" />
                      {selected && (
                        <div className="absolute right-3 top-3 flex h-[26px] w-[26px] items-center justify-center rounded-full bg-[#b2c5f2] shadow-md">
                          <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M2.5 7.5l3 3 6-6" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        </div>
                      )}
                    </div>
                    <p className={`max-w-[266px] truncate text-[16px] font-[590] ${selected ? 'text-white' : 'text-[#d5d5d5]'}`}>{doc.title || 'Untitled'}</p>
                  </div>
                )
              })}
            </div>
          )}

          <div className="mb-8 h-[1px] w-full bg-[rgba(255,255,255,0.1)]" />

          <div className="mb-6 flex items-center gap-4">
            <p className="font-unbounded text-[32px] font-medium text-[#d5d5d5]">
              {selectedDoc ? `Files in "${selectedDoc.title || 'Untitled'}"` : 'All Uploaded Files'}
            </p>
            {selectedDoc && (
              <button onClick={() => setSelectedProjectId(null)} className="flex cursor-pointer items-center gap-2 rounded-[15px] border border-[#a6a6a6] bg-[rgba(14,16,34,0.62)] px-4 py-1 text-[13px] text-[#d5d5d5] transition-colors hover:border-[#b2c5f2]">
                <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
                Show all files
              </button>
            )}
          </div>

          {shownFiles.length === 0 ? (
            <div className="flex h-[120px] items-center justify-center rounded-[20px] border border-dashed border-[rgba(178,197,242,0.15)]">
              <p className="text-[14px] text-[#4a4a5a]">{selectedDoc ? 'No files uploaded in this project yet' : 'No uploaded files yet — upload files inside your projects'}</p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-[24px]">
              {shownFiles.map((file, i) => {
                const openable = !!(file.localPath || file.url)
                return (
                  <div
                    key={file.id || i}
                    onClick={() => openable && window.vyrix.openFile(file)}
                    className={`flex w-[132px] flex-col items-center gap-2 ${openable ? 'cursor-pointer' : ''}`}
                  >
                    <FileTypeIcon type={file.type} name={file.name} size={102} />
                    <p className="w-full truncate text-center text-[14px] font-[590] text-white">{file.name}</p>
                    <p className="text-[12px] capitalize text-[#d5d5d5]">{file.type || 'File'}</p>
                  </div>
                )
              })}
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
