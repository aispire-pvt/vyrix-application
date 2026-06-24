import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { folders as foldersApi } from '../../api/local'

const imgFolderIcon = 'https://www.figma.com/api/mcp/asset/1215f116-0efb-4807-afb6-a33d26da873c'

export default function ProjectsSection({ folders = [], onFolderCreated, showHeading = true }) {
  const navigate = useNavigate()
  const [showInput, setShowInput] = useState(false)
  const [folderName, setFolderName] = useState('')
  const [creating, setCreating] = useState(false)
  const submittedRef = useRef(false)

  const openInput = () => { submittedRef.current = false; setShowInput(true) }

  const handleCreate = async () => {
    if (submittedRef.current) return
    const name = folderName.trim()
    if (!name) { setShowInput(false); setFolderName(''); return }
    submittedRef.current = true
    setCreating(true)
    try {
      const folder = await foldersApi.create(name, null)
      onFolderCreated?.(folder)
    } catch (err) {
      console.error('Failed to create folder:', err)
      submittedRef.current = false
    } finally {
      setCreating(false)
      setShowInput(false)
      setFolderName('')
    }
  }

  return (
    <div>
      {showHeading && <p className="mb-4 text-[20px] font-[590] text-[#d5d5d5]">Your Projects</p>}

      <div className="flex flex-wrap items-start gap-[40px]">
        {folders.map((folder) => (
          <div key={folder.id} onClick={() => navigate(`/folder/${folder.id}`)} className="group flex w-[108px] cursor-pointer flex-col items-center gap-[7px]">
            <img src={imgFolderIcon} alt={folder.name} className="h-[64px] w-[78px] shadow-[0px_6px_12px_rgba(0,0,0,0.4)] transition-transform duration-200 group-hover:scale-105" />
            <p className="w-full truncate text-center text-[15px] font-bold text-white">{folder.name}</p>
            <p className="text-center text-[11px] text-[#8d8d97]">{(folder.doc_count ?? 0)} {folder.doc_count === 1 ? 'item' : 'items'}</p>
          </div>
        ))}

        <div className="flex w-[108px] flex-col items-center gap-[7px]">
          {showInput ? (
            <input autoFocus type="text" value={folderName} onChange={(e) => setFolderName(e.target.value)}
              onBlur={handleCreate}
              onKeyDown={(e) => { if (e.key === 'Enter') handleCreate(); if (e.key === 'Escape') { setShowInput(false); setFolderName('') } }}
              placeholder="Folder name" maxLength={50} disabled={creating}
              className="h-[64px] w-[108px] rounded-[9px] border border-[rgba(178,197,242,0.3)] bg-transparent px-2 text-center text-[13px] text-white outline-none placeholder:text-[#4a4a5a]"
            />
          ) : (
            <button onClick={openInput} className="flex h-[64px] w-[108px] cursor-pointer items-center justify-center rounded-[9px] border border-dashed border-[rgba(178,197,242,0.3)] transition-colors hover:border-[rgba(178,197,242,0.6)]">
              <svg width="20" height="20" viewBox="0 0 22 22" fill="none"><path d="M11 4v14M4 11h14" stroke="#cfcfdc" strokeWidth="2" strokeLinecap="round" /></svg>
            </button>
          )}
          {!showInput && <p className="text-center text-[14.9px] text-[#cfcfdc]">New folder</p>}
        </div>
      </div>
    </div>
  )
}
