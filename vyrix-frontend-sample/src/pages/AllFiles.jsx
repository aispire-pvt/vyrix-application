import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import Sidebar from '../components/home/Sidebar'
import Navbar from '../components/home/Navbar'
import ProjectsSection from '../components/home/ProjectsSection'
import DocumentCard from '../components/home/DocumentCard'
import MoveModal from '../components/home/MoveModal'
import { relativeTime } from '../utils/relativeTime'
// GRADIENT 1 — same subtle blue glow used on the Home header (Figma All Files top section)
import headerGlow from '../assets/home/header-glow.png'

// Sort options — cycles on click
const SORT_OPTIONS = [
  { key: 'date_created', label: 'Date Created' },
  { key: 'last_edited', label: 'Last Edited' },
  { key: 'name', label: 'Name (A–Z)' },
]

// Repository Files assets (Figma)
const imgPdf1 = 'https://www.figma.com/api/mcp/asset/b8432742-8173-446b-8635-f7b9972f2945'
const imgPhoto1 = 'https://www.figma.com/api/mcp/asset/a05f6f2a-cf2d-4f28-85f2-32f29cb367b4'
const imgLink1 = 'https://www.figma.com/api/mcp/asset/b1cbfe2a-c104-4da9-9684-9e657f4867de'
const imgBox1 = 'https://www.figma.com/api/mcp/asset/92546667-6069-4a1c-b6ab-3af3d9ceb478'

export default function AllFiles() {
  const navigate = useNavigate()

  const [user, setUser] = useState(null)
  const [docs, setDocs] = useState([])
  const [folders, setFolders] = useState([])
  const [loading, setLoading] = useState(true)
  const [sortIndex, setSortIndex] = useState(0) // index into SORT_OPTIONS
  const [isTodoOpen, setIsTodoOpen] = useState(false)
  const [movingDoc, setMovingDoc] = useState(null)
  const [repoToast, setRepoToast] = useState(false)

  // Auto-hide the repo toast after 2.5s
  useEffect(() => {
    if (repoToast) {
      const t = setTimeout(() => setRepoToast(false), 2500)
      return () => clearTimeout(t)
    }
  }, [repoToast])

  useEffect(() => {
    let active = true
    Promise.all([
      api.get('/api/auth/me'),
      api.get('/api/docs'),
      api.get('/api/folders'),
    ])
      .then(([userRes, docsRes, foldersRes]) => {
        if (!active) return
        setUser(userRes.data.user)
        setDocs(docsRes.data.docs)
        setFolders(foldersRes.data.folders)
        setLoading(false)
      })
      .catch((err) => {
        if (!active) return
        if (err.response?.status === 401 || err.response?.status === 403) {
          navigate('/login')
        } else {
          setUser({ firstName: '', profilePic: null })
          setDocs([])
          setFolders([])
          setLoading(false)
        }
      })
    return () => {
      active = false
    }
  }, [navigate])

  // Client-side sort
  const sortedDocs = [...docs].sort((a, b) => {
    const sortBy = SORT_OPTIONS[sortIndex].key
    if (sortBy === 'name') return (a.title || '').localeCompare(b.title || '')
    if (sortBy === 'last_edited') return new Date(b.updatedAt) - new Date(a.updatedAt)
    return new Date(b.createdAt) - new Date(a.createdAt) // date_created
  })

  const cycleSortOption = () => setSortIndex((i) => (i + 1) % SORT_OPTIONS.length)

  const handleCreateDoc = async () => {
    try {
      const { data } = await api.post('/api/docs')
      navigate(`/doc/${data.doc._id}`)
    } catch (err) {
      console.error('Failed to create doc:', err)
    }
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
          {/* GRADIENT 1 — subtle blue glow behind the top section, faded out before the grid */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 z-0 select-none"
          >
            <img
              src={headerGlow}
              alt=""
              className="h-[760px] w-full object-cover opacity-50"
              style={{
                maskImage: 'linear-gradient(to bottom, black 28%, transparent 72%)',
                WebkitMaskImage: 'linear-gradient(to bottom, black 28%, transparent 72%)',
              }}
            />
          </div>

          {/* Content above the glow */}
          <div className="relative z-10">
          {/* Top row: heading left + Repository Files right */}
          <div className="mb-0 flex items-start justify-between gap-8">
            {/* Left: Your Projects heading */}
            <div className="flex-1">
              {/* Heading + Sort By on the same line */}
              <div className="mb-6 flex items-center gap-10">
                <h1 className="font-unbounded text-[40px] font-medium text-[#e7e7e7]">
                  Your Projects
                </h1>
                <button
                  onClick={cycleSortOption}
                  className="flex cursor-pointer items-center gap-2 rounded-[15px] border border-[#a6a6a6] bg-[rgba(14,16,34,0.62)] px-4 py-1 transition-colors hover:border-[#b2c5f2]"
                >
                  <span className="text-[20px] font-[510] text-white">Sort By</span>
                  <span className="flex items-center gap-1 text-[15px] text-white">
                    {SORT_OPTIONS[sortIndex].label}
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" className="ml-1">
                      <path d="M1 1l4 4 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </span>
                </button>
              </div>

              {/* Folders section label */}
              <p className="mb-3 text-[20px] font-[590] text-[#d5d5d5]">Folders</p>

              {/* Folders row — reuse ProjectsSection */}
              <ProjectsSection
                folders={folders}
                showHeading={false}
                onFolderCreated={(newFolder) =>
                  setFolders((prev) => [newFolder, ...prev])
                }
              />
            </div>

            {/* Right: Repository Files panel */}
            <div className="relative mt-2 w-[520px] shrink-0">
              <div className="relative w-full overflow-hidden rounded-[20px] border border-[rgba(178,197,242,0.12)] bg-[rgba(12,12,24,0.35)] p-6 shadow-[1px_4px_7.7px_5px_rgba(0,0,0,0.25)]">
                {/* box1 icon top-right */}
                <div className="absolute right-4 top-4 h-[52px] w-[52px]">
                  <img src={imgBox1} alt="" className="h-full w-full object-cover" />
                </div>

                {/* Heading */}
                <p className="mb-4 font-sf text-[32px] font-bold text-[#d5d5d5]">
                  Repository Files
                </p>

                {/* Recently Uploaded label + underline */}
                <div className="mb-4">
                  <p className="text-[14.9px] font-bold text-[#cfcfdc]">Recently Uploaded</p>
                  <div className="mt-1 h-[1px] w-[131px] bg-[rgba(178,197,242,0.3)]" />
                </div>

                {/* File icons row */}
                <div className="flex items-start gap-8">
                  {/* PDF file */}
                  <div className="flex flex-col items-center gap-2">
                    <img src={imgPdf1} alt="pdf" className="h-[72px] w-[72px] rounded-[8px] object-cover" />
                    <p className="w-[90px] truncate text-center text-[14px] font-[590] text-white">Research Paper 3</p>
                    <p className="text-[12px] text-[#d5d5d5]">Pdf</p>
                  </div>

                  {/* Photo file */}
                  <div className="flex flex-col items-center gap-2">
                    <img src={imgPhoto1} alt="photo" className="h-[72px] w-[72px] rounded-[8px] object-cover" />
                    <p className="w-[90px] truncate text-center text-[14px] font-[590] text-white">Research Paper 3</p>
                    <p className="text-[12px] text-[#d5d5d5]">Pdf</p>
                  </div>

                  {/* Link file */}
                  <div className="flex flex-col items-center gap-2">
                    <img src={imgLink1} alt="link" className="h-[72px] w-[72px] rounded-[8px] object-cover" />
                    <p className="w-[90px] truncate text-center text-[14px] font-[590] text-white">Research Paper 3</p>
                    <p className="text-[12px] text-[#d5d5d5]">Pdf</p>
                  </div>

                  {/* Open Repo link */}
                  <div className="ml-auto flex flex-col justify-center">
                    <button
                      onClick={() => setRepoToast(true)}
                      className="cursor-pointer text-[12px] text-[#d5d5d5] underline transition-colors hover:text-white"
                    >
                      Open Repo
                    </button>
                  </div>
                </div>

                {/* Arriving soon badge */}
                <div className="mt-4 flex justify-center">
                  <div className="flex items-center gap-2 rounded-[11px] border border-[rgba(178,197,242,0.32)] bg-[rgba(20,24,46,0.55)] px-4 py-2">
                    <span className="text-[12px] font-bold tracking-[0.24px] text-[#b2c5f2]">Arriving soon</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Divider between Folders section and All Projects */}
          <div className="my-8 h-[1px] w-full bg-[rgba(255,255,255,0.12)]" />

          {/* All Projects heading */}
          <p className="mb-6 font-unbounded text-[32px] font-medium text-[#d5d5d5]">
            All Projects
          </p>

          {/* Documents grid */}
          <div className="flex flex-wrap gap-[18px]">
            {/* Create new project — white bordered box */}
            <button
              onClick={handleCreateDoc}
              className="flex h-[167px] w-[267px] flex-shrink-0 cursor-pointer flex-col items-center justify-center gap-3 rounded-[20px] border border-white transition-all duration-200 hover:border-[#b2c5f2] hover:bg-[rgba(178,197,242,0.04)]"
            >
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <path d="M14 5v18M5 14h18" stroke="white" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <span className="px-4 text-center text-[22px] font-bold leading-tight text-white">
                Create new project
              </span>
            </button>

            {/* Document cards */}
            {sortedDocs.length === 0 ? (
              <div className="flex h-[167px] flex-1 flex-col items-center justify-center gap-3 rounded-[20px] border border-dashed border-[rgba(178,197,242,0.15)]">
                <div className="text-[28px]">📄</div>
                <p className="text-[14px] text-[#4a4a5a]">No documents yet</p>
                <p className="text-[12px] text-[#3a3a4a]">Hit "Create new project" to get started</p>
              </div>
            ) : (
              sortedDocs.map((doc) => (
                <DocumentCard
                  key={doc._id}
                  title={doc.title}
                  coverIndex={doc.coverIndex}
                  timestamp={relativeTime(doc.updatedAt)}
                  size="small"
                  onClick={() => navigate(`/doc/${doc._id}`)}
                  onMoveClick={() =>
                    setMovingDoc({ id: doc._id, title: doc.title, currentFolder: null })
                  }
                />
              ))
            )}
          </div>
          </div>
        </div>
      </div>

      {/* Move Modal */}
      <MoveModal
        isOpen={!!movingDoc}
        onClose={() => setMovingDoc(null)}
        docId={movingDoc?.id}
        docTitle={movingDoc?.title}
        currentFolder={movingDoc?.currentFolder}
        folders={folders}
        onMoved={async () => {
          setMovingDoc(null)
          // Refresh docs + folders
          try {
            const [docsRes, foldersRes] = await Promise.all([
              api.get('/api/docs'),
              api.get('/api/folders'),
            ])
            setDocs(docsRes.data.docs)
            setFolders(foldersRes.data.folders)
          } catch (err) {
            console.error('Refresh failed:', err)
          }
        }}
      />

      {/* Repo toast */}
      {repoToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-[11px] border border-[rgba(178,197,242,0.32)] bg-[rgba(20,24,46,0.95)] px-5 py-3 shadow-lg">
          <span className="text-[13px] font-bold text-[#b2c5f2]">Repository Files — Arriving soon</span>
        </div>
      )}
    </div>
  )
}
