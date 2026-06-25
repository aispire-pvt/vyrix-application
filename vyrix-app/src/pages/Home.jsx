import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMe, projects, folders as foldersApi } from '../api/local'
import { relativeTime } from '../utils/relativeTime'
import Sidebar from '../components/home/Sidebar'
import Navbar from '../components/home/Navbar'
import GreetingHeader from '../components/home/GreetingHeader'
import CreateProjectBar from '../components/home/CreateProjectBar'
import ProjectsSection from '../components/home/ProjectsSection'
import DocumentCard from '../components/home/DocumentCard'
import TodoPanel from '../components/home/TodoPanel'
import MoveModal from '../components/home/MoveModal'

export default function Home() {
  const navigate = useNavigate()
  const [isTodoOpen, setIsTodoOpen] = useState(false)

  const [user, setUser]       = useState(null)
  const [docs, setDocs]       = useState([])
  const [folderList, setFolderList] = useState([])
  const [loading, setLoading] = useState(true)
  const [movingDoc, setMovingDoc] = useState(null)

  useEffect(() => {
    let active = true
    Promise.all([
      getMe(),
      projects.list(),
      foldersApi.list(null),
    ])
      .then(([userRes, docRows, folderRows]) => {
        if (!active) return
        if (!userRes.success) { navigate('/login'); return }
        setUser(userRes.user)
        setDocs(docRows)
        setFolderList(folderRows)
        setLoading(false)
      })
      .catch(() => {
        if (!active) return
        navigate('/login')
      })
    return () => { active = false }
  }, [navigate])

  const handleCreateDoc = async () => {
    try {
      const doc = await projects.create()
      navigate(`/project/${doc.id}?source=home`)
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
        <Navbar onToggleTodo={() => setIsTodoOpen((v) => !v)} isTodoOpen={isTodoOpen} />

        <div className="flex-1 overflow-hidden bg-black px-[20px] pb-[20px]">
          <GreetingHeader
            firstName={user?.firstName}
            docs={docs}
            onOpenDoc={openDoc}
            onMoveDoc={(doc) =>
              setMovingDoc({ id: doc.id, title: doc.title, currentFolder: null })
            }
          />

          <div className="mt-4 flex flex-col gap-4 px-[39px] pb-[20px]">
            <CreateProjectBar onClick={handleCreateDoc} />
            <ProjectsSection
              folders={folderList}
              onFolderCreated={(newFolder) =>
                setFolderList((prev) => [newFolder, ...prev])
              }
            />

            {recentFiles.length > 0 && (
              <div>
                <p className="mb-3 text-[15px] font-[590] text-[#d5d5d5]">Recent Files</p>
                <div className="flex flex-wrap gap-[14px]">
                  {recentFiles.map((doc) => (
                    <DocumentCard
                      key={doc.id}
                      title={doc.title}
                      coverIndex={doc.cover_index}
                      timestamp={relativeTime(doc.updated_at)}
                      size="small"
                      onClick={() => openDoc(doc.id)}
                      onMoveClick={() =>
                        setMovingDoc({ id: doc.id, title: doc.title, currentFolder: null })
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
        folders={folderList}
        onMoved={async () => {
          setMovingDoc(null)
          const rows = await foldersApi.list(null)
          setFolderList(rows)
        }}
      />
    </div>
  )
}
