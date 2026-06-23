import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { relativeTime } from '../utils/relativeTime'
import Sidebar from '../components/home/Sidebar'
import Navbar from '../components/home/Navbar'
import GreetingHeader from '../components/home/GreetingHeader'
import CreateProjectBar from '../components/home/CreateProjectBar'
import ProjectsSection from '../components/home/ProjectsSection'
import DocumentCard from '../components/home/DocumentCard'
import TodoPanel from '../components/home/TodoPanel'
import MoveModal from '../components/home/MoveModal'

// Home dashboard — built level by level (Phase 4/5).
export default function Home() {
  const navigate = useNavigate()
  const [isTodoOpen, setIsTodoOpen] = useState(false)
  const toggleTodo = () => setIsTodoOpen((v) => !v)

  const [user, setUser] = useState(null)
  const [docs, setDocs] = useState([])
  const [folders, setFolders] = useState([])
  const [loading, setLoading] = useState(true)
  const [movingDoc, setMovingDoc] = useState(null)

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

  const handleCreateDoc = async () => {
    try {
      const { data } = await api.post('/api/docs')
      // A new project opens its overview (name/description/documents/flow repo),
      // not the editor — the editor is for documents created inside the project.
      navigate(`/project/${data.doc._id}?source=home`)
    } catch (err) {
      console.error('Failed to create project:', err)
    }
  }

  const openDoc = (id) => navigate(`/project/${id}?source=home`)

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-black">
        <p className="font-unbounded text-lg text-[#d5d5d5]">Loading...</p>
      </div>
    )
  }

  const recentFiles = docs.slice(0, 5)

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-black">
      <Sidebar user={user} activePage="home" />

      <div className="relative flex flex-1 flex-col overflow-hidden">
        <Navbar onToggleTodo={toggleTodo} isTodoOpen={isTodoOpen} />

        {/* Content area */}
        <div className="flex-1 overflow-y-auto bg-black px-[20px] pb-[20px]">
          <GreetingHeader
            firstName={user?.firstName}
            docs={docs}
            onOpenDoc={openDoc}
            onMoveDoc={(doc) =>
              setMovingDoc({ id: doc._id, title: doc.title, currentFolder: null })
            }
          />

          <div className="mt-6 flex flex-col gap-6 px-[39px] pb-[48px]">
            <CreateProjectBar onClick={handleCreateDoc} />
            <ProjectsSection
              folders={folders}
              onFolderCreated={(newFolder) =>
                setFolders((prev) => [newFolder, ...prev])
              }
            />

            {/* Recent Files bottom row */}
            {recentFiles.length > 0 && (
              <div>
                <p className="mb-4 text-[20px] font-[590] text-[#d5d5d5]">Recent Files</p>
                <div className="flex flex-wrap gap-[18px]">
                  {recentFiles.map((doc) => (
                    <DocumentCard
                      key={doc._id}
                      title={doc.title}
                      coverIndex={doc.coverIndex}
                      timestamp={relativeTime(doc.updatedAt)}
                      size="small"
                      onClick={() => openDoc(doc._id)}
                      onMoveClick={() =>
                        setMovingDoc({ id: doc._id, title: doc.title, currentFolder: null })
                      }
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <TodoPanel
          isOpen={isTodoOpen}
          onClose={() => setIsTodoOpen(false)}
          firstName={user?.firstName}
        />
      </div>

      <MoveModal
        isOpen={!!movingDoc}
        onClose={() => setMovingDoc(null)}
        docId={movingDoc?.id}
        docTitle={movingDoc?.title}
        currentFolder={movingDoc?.currentFolder}
        folders={folders}
        onMoved={async () => {
          setMovingDoc(null)
          // Refetch folders so docCounts are accurate (optimistic counts can drift).
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
