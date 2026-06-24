import { useState, useEffect, useRef } from 'react'
import { projects, folders as foldersApi } from '../../api/local'
import { relativeTime } from '../../utils/relativeTime'

const imgFolderIcon = 'https://www.figma.com/api/mcp/asset/1215f116-0efb-4807-afb6-a33d26da873c'

export default function MoveModal({ isOpen, onClose, docId, docTitle, currentFolder, folders = [], onMoved }) {
  const [search, setSearch]           = useState('')
  const [selected, setSelected]       = useState(null)
  const [moving, setMoving]           = useState(false)
  const [showNewInput, setShowNewInput] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [localFolders, setLocalFolders] = useState(folders)
  const searchRef = useRef(null)
  const folderSubmittedRef = useRef(false)

  useEffect(() => {
    if (isOpen) {
      setSearch('')
      setSelected(null)
      setMoving(false)
      setShowNewInput(false)
      setNewFolderName('')
      setLocalFolders(folders)
      setTimeout(() => searchRef.current?.focus(), 100)
    }
  }, [isOpen, folders])

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose() }
    if (isOpen) window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [isOpen, onClose])

  const filtered = localFolders.filter((f) => f.name.toLowerCase().includes(search.toLowerCase()))

  const handleMove = async () => {
    if (!selected || moving) return
    setMoving(true)
    try {
      await projects.move(docId, selected)
      onMoved?.(docId, selected)
      onClose()
    } catch (err) {
      console.error('Move failed:', err)
      setMoving(false)
    }
  }

  const handleCreateFolder = async () => {
    if (folderSubmittedRef.current) return
    const name = newFolderName.trim()
    if (!name) { setShowNewInput(false); setNewFolderName(''); return }
    folderSubmittedRef.current = true
    try {
      const folder = await foldersApi.create(name, null)
      setLocalFolders((prev) => [folder, ...prev])
      setSelected(folder.id)
    } catch (err) {
      console.error('Create folder failed:', err)
      folderSubmittedRef.current = false
    } finally {
      setShowNewInput(false)
      setNewFolderName('')
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.6)]" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="w-[413px] overflow-hidden rounded-[22px] border border-[rgba(140,140,140,0.5)] bg-[rgba(12,12,24,0.95)] shadow-[0px_40px_100px_rgba(0,0,0,0.6)]">
        <div className="relative border-b border-[rgba(150,150,165,0.16)] px-[27px] pb-[19px] pt-[25px]">
          <button onClick={onClose} className="absolute right-3 top-3 flex h-[33px] w-[33px] cursor-pointer items-center justify-center rounded-[10px] border border-[rgba(150,150,165,0.16)] bg-[rgba(255,255,255,0.05)] text-[16px] text-white transition-colors hover:bg-[rgba(255,255,255,0.1)]">×</button>
          <p className="text-[18.6px] font-bold text-white">Move <span className="text-[#b2c5f2]">{docTitle}</span></p>
          <div className="mt-[11px] flex items-center gap-2">
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M1.5 4.5h12M1.5 7.5h9M1.5 10.5h6" stroke="#8d8d97" strokeWidth="1.5" strokeLinecap="round" /></svg>
            <span className="text-[12.7px] text-[#8d8d97]">Currently in</span>
            <span className="text-[12.7px] text-[#c7c7c7]">{currentFolder ? currentFolder.name : 'Recent · No folder'}</span>
          </div>
        </div>

        <div className="mx-[27px] mt-[12px] flex items-center gap-3 rounded-[13px] border border-[#dcdcdc] px-[16px] py-[13px]">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="7" cy="7" r="5" stroke="#7e7e8c" strokeWidth="1.5" /><path d="M11 11l3 3" stroke="#7e7e8c" strokeWidth="1.5" strokeLinecap="round" /></svg>
          <input ref={searchRef} type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search folders…" className="flex-1 bg-transparent text-[13.7px] text-[#e7e7e7] outline-none placeholder:text-[#7e7e8c]" />
        </div>

        <div className="mt-[8px] max-h-[294px] overflow-y-auto px-[17px] py-[8px]">
          {filtered.map((folder) => (
            <div key={folder.id} onClick={() => setSelected(folder.id)}
              className={`flex cursor-pointer items-center gap-[14.7px] rounded-[13px] px-[14.7px] py-[13.72px] transition-colors ${selected === folder.id ? 'bg-[rgba(178,197,242,0.08)]' : 'hover:bg-[rgba(255,255,255,0.04)]'}`}
            >
              <img src={imgFolderIcon} alt="" className="h-[33px] w-[41px] object-contain" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14.7px] font-bold text-white">{folder.name}</p>
                <p className="text-[12px] text-[#8d8d97]">{folder.doc_count ?? 0} projects · {relativeTime(folder.updated_at || folder.created_at)}</p>
              </div>
              <div className={`flex h-[21.56px] w-[21.56px] flex-shrink-0 items-center justify-center rounded-full border-2 transition-colors ${selected === folder.id ? 'border-[#b2c5f2] bg-[#b2c5f2]' : 'border-[#5a5a6e]'}`}>
                {selected === folder.id && <div className="h-[8px] w-[8px] rounded-full bg-black" />}
              </div>
            </div>
          ))}

          {showNewInput ? (
            <div className="flex items-center gap-3 px-[14.7px] py-[10px]">
              <div className="flex h-[33px] w-[41px] flex-shrink-0 items-center justify-center rounded-[9px] border border-dashed border-[rgba(178,197,242,0.5)]">
                <span className="text-[16px] text-[#b2c5f2]">+</span>
              </div>
              <input autoFocus type="text" value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)}
                onBlur={handleCreateFolder}
                onKeyDown={(e) => { if (e.key === 'Enter') handleCreateFolder(); if (e.key === 'Escape') { setShowNewInput(false); setNewFolderName('') } }}
                placeholder="Folder name" maxLength={50}
                className="flex-1 border-b border-[rgba(178,197,242,0.3)] bg-transparent text-[14px] text-white outline-none placeholder:text-[#4a4a5a]"
              />
            </div>
          ) : (
            <div onClick={() => { folderSubmittedRef.current = false; setShowNewInput(true) }} className="flex cursor-pointer items-center gap-[14.7px] rounded-[13px] px-[14.7px] py-[13.72px] transition-colors hover:bg-[rgba(255,255,255,0.04)]">
              <div className="flex h-[33px] w-[41px] flex-shrink-0 items-center justify-center rounded-[9px] border border-dashed border-[rgba(178,197,242,0.5)]">
                <span className="text-[19px] text-[#b2c5f2]">+</span>
              </div>
              <span className="text-[14.7px] font-bold text-[#b2c5f2]">Create new folder</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-[rgba(150,150,165,0.16)] px-[27px] py-[19px]">
          <button onClick={onClose} className="cursor-pointer rounded-[13px] border border-[rgba(140,140,140,0.5)] px-[24px] py-[12px] text-[14.2px] font-bold text-[#d5d5d5] transition-colors hover:bg-[rgba(255,255,255,0.05)]">Cancel</button>
          <button onClick={handleMove} disabled={!selected || moving}
            className={`rounded-[13px] px-[24px] py-[12px] text-[14.2px] font-bold text-black transition-all ${selected && !moving ? 'cursor-pointer bg-[#b2c5f2] hover:bg-[#c5d4f5]' : 'cursor-not-allowed bg-[#b2c5f2] opacity-40'}`}
          >
            {moving ? 'Moving...' : 'Move here'}
          </button>
        </div>
      </div>
    </div>
  )
}
