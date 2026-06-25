import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../api/axios'
import Sidebar from '../components/home/Sidebar'
import Navbar from '../components/home/Navbar'
import DocumentCard from '../components/home/DocumentCard'
import MoveModal from '../components/home/MoveModal'
import { relativeTime } from '../utils/relativeTime'

// Figma asset — same folder icon used across the app.
const imgFolderIcon = 'https://www.figma.com/api/mcp/asset/1215f116-0efb-4807-afb6-a33d26da873c'

export default function Folder() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [user, setUser] = useState(null)
  const [folder, setFolder] = useState(null)
  const [ancestors, setAncestors] = useState([])
  const [subFolders, setSubFolders] = useState([])
  const [docs, setDocs] = useState([])
  const [folders, setFolders] = useState([])
  const [loading, setLoading] = useState(true)
  const [isTodoOpen, setIsTodoOpen] = useState(false)
  const [movingDoc, setMovingDoc] = useState(null)
  const [showFolderInput, setShowFolderInput] = useState(false)
  const [newSubFolderName, setNewSubFolderName] = useState('')
  // Guards against a double create (Enter submit + stray blur on unmount).
  const folderSubmittedRef = useRef(false)

  useEffect(() => {
    let active = true
    Promise.all([
      api.get('/api/auth/me'),
      api.get(`/api/folders/${id}/docs`),
      api.get('/api/folders'),
    ])
      .then(([userRes, folderRes, foldersRes]) => {
        if (!active) return
        setUser(userRes.data.user)
        setFolder(folderRes.data.folder)
        setAncestors(folderRes.data.ancestors || [])
        setSubFolders(folderRes.data.subFolders || [])
        setDocs(folderRes.data.docs)
        setFolders(foldersRes.data.folders)
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

  const handleCreateDocInFolder = async () => {
    try {
      const { data: docData } = await api.post('/api/docs')
      await api.patch(`/api/docs/${docData.doc._id}/move`, { folderId: id })
      // Open the new project's overview, not the editor.
      navigate(
        `/project/${docData.doc._id}?source=folder&folderName=${encodeURIComponent(folder?.name || '')}`
      )
    } catch (err) {
      console.error('Failed to create project in folder:', err)
    }
  }

  const openFolderInput = () => {
    folderSubmittedRef.current = false
    setShowFolderInput(true)
  }

  const handleCreateSubFolder = async () => {
    if (folderSubmittedRef.current) return
    const name = newSubFolderName.trim()
    if (!name) {
      setShowFolderInput(false)
      setNewSubFolderName('')
      return
    }
    folderSubmittedRef.current = true
    try {
      // Nest the new folder inside the current folder.
      const { data } = await api.post('/api/folders', { name, parent: id })
      setSubFolders((prev) => [data.folder, ...prev])
    } catch (err) {
      console.error('Failed to create folder:', err)
      folderSubmittedRef.current = false // allow retry on failure
    } finally {
      setShowFolderInput(false)
      setNewSubFolderName('')
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
      <Sidebar user={user} activePage="home" />

      <div className="relative flex flex-1 flex-col overflow-hidden">
        <Navbar
          onToggleTodo={() => setIsTodoOpen((v) => !v)}
          isTodoOpen={isTodoOpen}
        />

        <div className="flex-1 overflow-y-auto px-[39px] pb-[48px] pt-8">
          {/* Breadcrumb: Home > …ancestors… > current */}
          <div className="mb-8 flex flex-wrap items-center gap-2">
            <button
              onClick={() => navigate('/home')}
              className="cursor-pointer text-[20px] font-[590] text-[#8d8d97] transition-colors hover:text-white"
            >
              Home
            </button>
            {ancestors.map((a) => (
              <span key={a._id} className="flex items-center gap-2">
                <span className="text-[20px] text-[#8d8d97]">›</span>
                <button
                  onClick={() => navigate(`/folder/${a._id}`)}
                  className="cursor-pointer text-[20px] font-[590] text-[#8d8d97] transition-colors hover:text-white"
                >
                  {a.name}
                </button>
              </span>
            ))}
            <span className="text-[20px] text-[#8d8d97]">›</span>
            <span className="text-[20px] font-[590] text-[#dcdcdc]">{folder?.name}</span>
          </div>

          {/* Section 1: Folders row — sub-folders + New folder */}
          <div className="mb-10 flex flex-wrap items-start gap-[40px]">
            {subFolders.map((sub) => (
              <div
                key={sub._id}
                onClick={() => navigate(`/folder/${sub._id}`)}
                className="group flex w-[108px] cursor-pointer flex-col items-center gap-[7px]"
              >
                <img
                  src={imgFolderIcon}
                  alt={sub.name}
                  className="h-[64px] w-[78px] shadow-[0px_6px_12px_rgba(0,0,0,0.4)] transition-transform duration-200 group-hover:scale-105"
                />
                <p className="w-full truncate text-center text-[15px] font-bold text-white">
                  {sub.name}
                </p>
                <p className="text-center text-[11px] text-[#8d8d97]">
                  {(sub.docCount ?? 0)} {sub.docCount === 1 ? 'item' : 'items'}
                </p>
              </div>
            ))}

            {/* "New folder" — inline input or button */}
            <div className="flex w-[108px] flex-col items-center gap-[7px]">
              {showFolderInput ? (
                <input
                  autoFocus
                  type="text"
                  value={newSubFolderName}
                  onChange={(e) => setNewSubFolderName(e.target.value)}
                  onBlur={handleCreateSubFolder}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCreateSubFolder()
                    if (e.key === 'Escape') {
                      setShowFolderInput(false)
                      setNewSubFolderName('')
                    }
                  }}
                  placeholder="Folder name"
                  maxLength={50}
                  className="h-[64px] w-[108px] rounded-[9px] border border-[rgba(178,197,242,0.3)] bg-transparent px-2 text-center text-[13px] text-white outline-none placeholder:text-[#4a4a5a]"
                />
              ) : (
                <button
                  onClick={openFolderInput}
                  className="flex h-[64px] w-[108px] cursor-pointer items-center justify-center rounded-[9px] border border-dashed border-[rgba(178,197,242,0.3)] transition-colors hover:border-[rgba(178,197,242,0.6)]"
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M10 4v12M4 10h12" stroke="#cfcfdc" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>
              )}
              {!showFolderInput && (
                <p className="text-center text-[14.9px] text-[#cfcfdc]">New folder</p>
              )}
            </div>
          </div>

          {/* Section 2: Projects row — Create new project (first) + documents */}
          <div className="flex flex-wrap items-start gap-[40px]">
            {/* Create new project — white bordered box */}
            <button
              onClick={handleCreateDocInFolder}
              className="flex h-[167px] w-[267px] cursor-pointer flex-col items-center justify-center gap-3 rounded-[20px] border border-white transition-all duration-200 hover:border-[#b2c5f2] hover:bg-[rgba(178,197,242,0.04)]"
            >
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <path d="M14 5v18M5 14h18" stroke="white" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <span className="px-4 text-center text-[22px] font-bold leading-tight text-white">
                Create new project
              </span>
            </button>

            {/* Document cards */}
            {docs.map((doc) => (
              <DocumentCard
                key={doc._id}
                title={doc.title}
                coverIndex={doc.coverIndex}
                timestamp={relativeTime(doc.updatedAt)}
                size="small"
                onClick={() =>
                  navigate(
                    `/project/${doc._id}?source=folder&folderName=${encodeURIComponent(folder?.name || '')}`
                  )
                }
                onMoveClick={() =>
                  setMovingDoc({ id: doc._id, title: doc.title, currentFolder: folder })
                }
              />
            ))}
          </div>
        </div>
      </div>

      <MoveModal
        isOpen={!!movingDoc}
        onClose={() => setMovingDoc(null)}
        docId={movingDoc?.id}
        docTitle={movingDoc?.title}
        currentFolder={movingDoc?.currentFolder}
        folders={folders}
        onMoved={async (docId, folderId) => {
          setMovingDoc(null)
          // Doc moved out of this folder → remove it from the current list.
          if (folderId !== id) {
            setDocs((prev) => prev.filter((d) => d._id !== docId))
          }
          // Refresh folders so docCounts stay accurate.
          try {
            const { data } = await api.get('/api/folders')
            setFolders(data.folders)
          } catch (err) {
            console.error('Failed to refresh folders:', err)
          }
        }}
      />
    </div>
  )
}
