import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMe, projects, folders as foldersApi } from '../api/local'
import Sidebar from '../components/home/Sidebar'
import Navbar from '../components/home/Navbar'
import ProjectsSection from '../components/home/ProjectsSection'
import DocumentCard from '../components/home/DocumentCard'
import MoveModal from '../components/home/MoveModal'
import TodoPanel from '../components/home/TodoPanel'
import FileTypeIcon from '../components/project/FileTypeIcon'
import { relativeTime } from '../utils/relativeTime'
import headerGlow from '../assets/home/header-glow.png'

const SORT_OPTIONS = [
  { key: 'date_created', label: 'Date Created' },
  { key: 'last_edited',  label: 'Last Edited'  },
  { key: 'name',         label: 'Name (A–Z)'   },
]

const imgBox1 = 'https://www.figma.com/api/mcp/asset/92546667-6069-4a1c-b6ab-3af3d9ceb478'

export default function AllFiles() {
  const navigate = useNavigate()

  const [user, setUser]         = useState(null)
  const [docs, setDocs]         = useState([])
  const [folderList, setFolderList] = useState([])
  const [loading, setLoading]   = useState(true)
  const [sortIndex, setSortIndex] = useState(0)
  const [isTodoOpen, setIsTodoOpen] = useState(false)
  const [movingDoc, setMovingDoc] = useState(null)

  useEffect(() => {
    let active = true
    Promise.all([getMe(), projects.list(), foldersApi.list(null)])
      .then(([userRes, docRows, folderRows]) => {
        if (!active) return
        if (!userRes.success) { navigate('/login'); return }
        setUser(userRes.user)
        setDocs(docRows)
        setFolderList(folderRows)
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

  const recentRepoFiles = docs
    .flatMap((doc) => [
      ...(doc.attachments || []),
      ...(doc.flows || []).flatMap((f) => f.files || []),
    ])
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 3)

  const handleCreateDoc = async () => {
    try {
      const doc = await projects.create()
      navigate(`/project/${doc.id}?source=allfiles`)
    } catch (err) { console.error('Failed to create project:', err) }
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
      <Sidebar user={user} activePage="allfiles" />

      <div className="relative flex flex-1 flex-col overflow-hidden">
        <Navbar onToggleTodo={() => setIsTodoOpen((v) => !v)} isTodoOpen={isTodoOpen} />

        <div className="relative flex-1 overflow-y-auto px-[39px] pb-[48px] pt-6">
          <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 z-0 select-none">
            <img src={headerGlow} alt="" className="h-[760px] w-full object-cover opacity-50"
              style={{ maskImage: 'linear-gradient(to bottom, black 28%, transparent 72%)', WebkitMaskImage: 'linear-gradient(to bottom, black 28%, transparent 72%)' }}
            />
          </div>

          <div className="relative z-10">
            <div className="mb-0 flex items-start justify-between gap-8">
              <div className="flex-1">
                <div className="mb-6 flex items-center gap-10">
                  <h1 className="font-unbounded text-[40px] font-medium text-[#e7e7e7]">Your Projects</h1>
                  <button onClick={() => setSortIndex((i) => (i + 1) % SORT_OPTIONS.length)}
                    className="flex cursor-pointer items-center gap-2 rounded-[15px] border border-[#a6a6a6] bg-[rgba(14,16,34,0.62)] px-4 py-1 transition-colors hover:border-[#b2c5f2]"
                  >
                    <span className="text-[20px] font-[510] text-white">Sort By</span>
                    <span className="flex items-center gap-1 text-[15px] text-white">
                      {SORT_OPTIONS[sortIndex].label}
                      <svg width="10" height="6" viewBox="0 0 10 6" fill="none" className="ml-1"><path d="M1 1l4 4 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" /></svg>
                    </span>
                  </button>
                </div>

                <p className="mb-3 text-[20px] font-[590] text-[#d5d5d5]">Folders</p>
                <ProjectsSection
                  folders={folderList}
                  showHeading={false}
                  onFolderCreated={(f) => setFolderList((prev) => [f, ...prev])}
                />
              </div>

              {/* Repository Files panel */}
              <div className="relative mt-2 w-[520px] shrink-0">
                <div className="relative w-full overflow-hidden rounded-[20px] border border-[rgba(178,197,242,0.12)] bg-[rgba(12,12,24,0.35)] p-6 shadow-[1px_4px_7.7px_5px_rgba(0,0,0,0.25)]">
                  <div className="absolute right-4 top-4 h-[52px] w-[52px]">
                    <img src={imgBox1} alt="" className="h-full w-full object-cover" />
                  </div>
                  <p className="mb-4 font-sf text-[32px] font-bold text-[#d5d5d5]">Repository Files</p>
                  <div className="mb-4">
                    <p className="text-[14.9px] font-bold text-[#cfcfdc]">Recently Uploaded</p>
                    <div className="mt-1 h-[1px] w-[131px] bg-[rgba(178,197,242,0.3)]" />
                  </div>
                  <div className="flex items-start gap-8">
                    {recentRepoFiles.length === 0 ? (
                      <p className="text-[13px] text-[#4a4a5a]">No files uploaded yet</p>
                    ) : (
                      recentRepoFiles.map((file, i) => (
                        <div key={file.id || i} className="flex flex-col items-center gap-2">
                          <FileTypeIcon type={file.type} name={file.name} size={72} />
                          <p className="w-[90px] truncate text-center text-[14px] font-[590] text-white">{file.name}</p>
                          <p className="text-[12px] capitalize text-[#d5d5d5]">{file.type || 'File'}</p>
                        </div>
                      ))
                    )}
                    <div className="ml-auto flex flex-col justify-center">
                      <button onClick={() => navigate('/repo')} className="cursor-pointer text-[12px] text-[#d5d5d5] underline transition-colors hover:text-white">Open Repo</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="my-8 h-[1px] w-full bg-[rgba(255,255,255,0.12)]" />

            <p className="mb-6 font-unbounded text-[32px] font-medium text-[#d5d5d5]">All Projects</p>

            <div className="flex flex-wrap gap-[18px]">
              <button onClick={handleCreateDoc}
                className="flex h-[167px] w-[267px] flex-shrink-0 cursor-pointer flex-col items-center justify-center gap-3 rounded-[20px] border border-white transition-all duration-200 hover:border-[#b2c5f2] hover:bg-[rgba(178,197,242,0.04)]"
              >
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><path d="M14 5v18M5 14h18" stroke="white" strokeWidth="2" strokeLinecap="round" /></svg>
                <span className="px-4 text-center text-[22px] font-bold leading-tight text-white">Create new project</span>
              </button>

              {sortedDocs.length === 0 ? (
                <div className="flex h-[167px] flex-1 flex-col items-center justify-center gap-3 rounded-[20px] border border-dashed border-[rgba(178,197,242,0.15)]">
                  <p className="text-[14px] text-[#4a4a5a]">No documents yet</p>
                </div>
              ) : (
                sortedDocs.map((doc) => (
                  <DocumentCard key={doc.id}
                    title={doc.title}
                    coverIndex={doc.cover_index}
                    timestamp={relativeTime(doc.updated_at)}
                    size="small"
                    onClick={() => navigate(`/project/${doc.id}?source=allfiles`)}
                    onMoveClick={() => setMovingDoc({ id: doc.id, title: doc.title, currentFolder: null })}
                  />
                ))
              )}
            </div>
          </div>
        </div>

        <TodoPanel isOpen={isTodoOpen} onClose={() => setIsTodoOpen(false)} firstName={user?.firstName} />
      </div>

      <MoveModal
        isOpen={!!movingDoc}
        onClose={() => setMovingDoc(null)}
        docId={movingDoc?.id}
        docTitle={movingDoc?.title}
        currentFolder={movingDoc?.currentFolder}
        folders={folderList}
        onMoved={async () => {
          setMovingDoc(null)
          const [docRows, folderRows] = await Promise.all([projects.list(), foldersApi.list(null)])
          setDocs(docRows)
          setFolderList(folderRows)
        }}
      />
    </div>
  )
}
