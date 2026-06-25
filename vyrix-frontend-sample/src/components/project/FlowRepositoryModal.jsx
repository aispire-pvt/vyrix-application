import { useEffect, useRef, useState } from 'react'
import api from '../../api/axios'
import FlowNode from './FlowNode'
import FileTypeIcon from './FileTypeIcon'

// A single file card — type icon + name + type (Figma 299:4255-4260).
function FileCard({ file }) {
  const inner = (
    <div className="flex w-[140px] flex-col items-center gap-2">
      <FileTypeIcon type={file.type} name={file.name} size={88} />
      <p className="w-full truncate text-center font-sf text-[16px] font-[590] text-white">{file.name}</p>
      <p className="text-center font-sf text-[12px] capitalize text-[#d5d5d5]">{file.type}</p>
    </div>
  )
  return file.url ? (
    <a href={file.url} target="_blank" rel="noreferrer" className="cursor-pointer">
      {inner}
    </a>
  ) : (
    inner
  )
}

// Exact diagram geometry (from Figma 298:3132). Cards are 266×164 in two rows
// (top + staggered bottom). Flows grow HORIZONTALLY — each new pair adds a
// column to the right — and the area scrolls sideways via the bar below.
const CARD_W = 266
const CARD_H = 164
const COL_PITCH = 422 // horizontal distance between two cards in the same row
const HALF = 211 // bottom row is offset right by half a column (the snake stagger)
const ROW_PITCH = 266 // vertical distance between the top and bottom rows
const LABEL_GAP = 30 // room for the label that sits between a card and the bus
const BUS_STUB = 22 // short vertical stub from a card to the central bus
const BUS_Y = CARD_H + (ROW_PITCH - CARD_H) / 2 // central horizontal bus line

// Top-left position of card i. Even indices = top row, odd = staggered bottom row.
function cardPos(i) {
  const col = Math.floor(i / 2)
  const bottom = i % 2 === 1
  return { x: col * COL_PITCH + (bottom ? HALF : 0), y: bottom ? ROW_PITCH : 0, bottom }
}

// Horizontal scroll wrapper with a custom draggable scrollbar (Figma Rectangle 23).
function HScroll({ children }) {
  const scrollRef = useRef(null)
  const trackRef = useRef(null)
  const dragRef = useRef(null)
  const [thumb, setThumb] = useState({ width: 100, left: 0, visible: false })

  const sync = () => {
    const el = scrollRef.current
    if (!el) return
    const ratio = el.clientWidth / el.scrollWidth
    const width = Math.max(ratio * 100, 8)
    const scrollable = el.scrollWidth - el.clientWidth
    const progress = scrollable > 0 ? el.scrollLeft / scrollable : 0
    setThumb({ width, left: progress * (100 - width), visible: ratio < 0.999 })
  }

  useEffect(() => {
    sync()
    const el = scrollRef.current
    if (!el) return
    const ro = new ResizeObserver(sync)
    ro.observe(el)
    return () => ro.disconnect()
  })

  const onThumbDown = (e) => {
    e.preventDefault()
    const el = scrollRef.current
    const track = trackRef.current
    if (!el || !track) return
    const trackW = track.clientWidth
    const thumbPx = trackW * (el.clientWidth / el.scrollWidth)
    const freeTrack = trackW - thumbPx
    const scrollable = el.scrollWidth - el.clientWidth
    dragRef.current = { startX: e.clientX, startScroll: el.scrollLeft, freeTrack, scrollable }
    const move = (ev) => {
      const d = dragRef.current
      if (!d || d.freeTrack <= 0) return
      const dx = ev.clientX - d.startX
      el.scrollLeft = Math.max(0, Math.min(d.scrollable, d.startScroll + (dx / d.freeTrack) * d.scrollable))
    }
    const up = () => {
      dragRef.current = null
      window.removeEventListener('mousemove', move)
      window.removeEventListener('mouseup', up)
    }
    window.addEventListener('mousemove', move)
    window.addEventListener('mouseup', up)
  }

  return (
    <div>
      <div
        ref={scrollRef}
        onScroll={sync}
        className="overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </div>
      {thumb.visible && (
        <div ref={trackRef} className="relative mx-auto mt-6 h-[12px] w-[82%] rounded-full bg-[rgba(255,255,255,0.06)]">
          <div
            onMouseDown={onThumbDown}
            className="absolute top-0 h-[12px] cursor-grab rounded-full bg-[rgba(178,197,242,0.45)] transition-colors hover:bg-[rgba(178,197,242,0.7)] active:cursor-grabbing"
            style={{ width: `${thumb.width}%`, left: `${thumb.left}%` }}
          />
        </div>
      )}
    </div>
  )
}

// Props: { isOpen, onClose, projectId, flows, onFlowsChange }
export default function FlowRepositoryModal({ isOpen, onClose, projectId, flows = [], onFlowsChange }) {
  const [view, setView] = useState('diagram') // 'diagram' | 'flow'
  const [selectedFlowId, setSelectedFlowId] = useState(null)
  const [showInFlow, setShowInFlow] = useState(true)

  // diagram edit/drag
  const [isEditMode, setIsEditMode] = useState(false)
  const [localFlows, setLocalFlows] = useState(flows)
  const [saving, setSaving] = useState(false)
  const dragIndexRef = useRef(null)

  // add flow / add file
  const [showNewFlowInput, setShowNewFlowInput] = useState(false)
  const [newFlowName, setNewFlowName] = useState('')
  const [showAddMenu, setShowAddMenu] = useState(false)
  const [showLinkInput, setShowLinkInput] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const fileInputRef = useRef(null)

  // Reset to the diagram whenever the modal opens.
  useEffect(() => {
    if (isOpen) {
      setView('diagram')
      setSelectedFlowId(null)
      setIsEditMode(false)
      setShowAddMenu(false)
      setShowLinkInput(false)
      setShowNewFlowInput(false)
      setShowInFlow(true)
    }
  }, [isOpen])

  // Close on Escape (from the diagram view).
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        if (view === 'flow') setView('diagram')
        else onClose()
      }
    }
    if (isOpen) window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, view, onClose])

  if (!isOpen) return null

  const displayFlows = isEditMode ? localFlows : flows
  const selectedFlow = flows.find((f) => f.id === selectedFlowId)
  const allFiles = flows.flatMap((f) => f.files || [])

  // Lay out the flow cards on the staggered snake, growing horizontally.
  const positions = displayFlows.map((_, i) => cardPos(i))
  const diagramW = Math.max(CARD_W, ...positions.map((p) => p.x + CARD_W))
  const diagramH = ROW_PITCH + CARD_H + LABEL_GAP
  const topCenters = positions.filter((p) => !p.bottom).map((p) => p.x + CARD_W / 2)
  const botCenters = positions.filter((p) => p.bottom).map((p) => p.x + CARD_W / 2)
  const allCenters = positions.map((p) => p.x + CARD_W / 2)
  const busStart = allCenters.length ? Math.min(...allCenters) : 0
  const busEnd = allCenters.length ? Math.max(...allCenters) : 0

  // ---- diagram actions ----
  const handleDragStart = (index) => {
    dragIndexRef.current = index
  }
  const handleDrop = (dropIndex) => {
    const dragIndex = dragIndexRef.current
    if (dragIndex === null || dragIndex === dropIndex) return
    const reordered = [...localFlows]
    const [removed] = reordered.splice(dragIndex, 1)
    reordered.splice(dropIndex, 0, removed)
    setLocalFlows(reordered)
    dragIndexRef.current = null
  }
  const toggleEditMode = async () => {
    if (isEditMode) {
      setSaving(true)
      try {
        await api.patch(`/api/docs/${projectId}/flows/reorder`, {
          flowIds: localFlows.map((f) => f.id),
        })
        onFlowsChange?.(localFlows)
      } catch (err) {
        console.error('Failed to save flow order:', err)
        setLocalFlows(flows)
      } finally {
        setSaving(false)
      }
    } else {
      setLocalFlows([...flows])
    }
    setIsEditMode((v) => !v)
  }
  const handleAddFlow = async () => {
    const name = newFlowName.trim() || 'New Flow'
    try {
      const { data } = await api.post(`/api/docs/${projectId}/flows`, { name })
      const next = [...(flows || []), data.flow]
      onFlowsChange?.(next)
      setLocalFlows(next)
    } catch (err) {
      console.error('Failed to add flow:', err)
    } finally {
      setShowNewFlowInput(false)
      setNewFlowName('')
    }
  }
  const handleDeleteFlow = async (flowId) => {
    const next = flows.filter((f) => f.id !== flowId)
    onFlowsChange?.(next)
    setLocalFlows(next)
    try {
      await api.delete(`/api/docs/${projectId}/flows/${flowId}`)
    } catch (err) {
      console.error('Failed to delete flow:', err)
    }
  }

  // ---- per-flow file actions ----
  const updateFlowFiles = (file) => {
    const next = flows.map((f) =>
      f.id === selectedFlowId ? { ...f, files: [...(f.files || []), file] } : f
    )
    onFlowsChange?.(next)
  }
  const handleAddLink = async () => {
    const url = linkUrl.trim()
    if (!url) return
    try {
      const { data } = await api.post(`/api/docs/${projectId}/flows/${selectedFlowId}/files`, {
        type: 'link',
        name: url,
        url,
      })
      updateFlowFiles(data.file)
      setLinkUrl('')
      setShowLinkInput(false)
    } catch (err) {
      console.error('Failed to add link:', err)
    }
  }
  const handleAddFile = async (file) => {
    try {
      const formData = new FormData()
      formData.append('file', file)
      const { data } = await api.post(
        `/api/docs/${projectId}/flows/${selectedFlowId}/files`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      )
      updateFlowFiles(data.file)
    } catch (err) {
      console.error('Failed to upload file:', err)
    }
  }

  const openFlow = (flowId) => {
    setSelectedFlowId(flowId)
    setView('flow')
  }

  // Reusable header bits ------------------------------------------------------
  const FolderIcon = (
    <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="#d5d5d5" strokeWidth="1.4" className="mt-[2px] shrink-0">
      <path d="M21 19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h4l2 2.5h8a2 2 0 0 1 2 2z" />
    </svg>
  )
  const CloseBtn = (
    <button
      onClick={onClose}
      className="flex h-[34px] w-[34px] shrink-0 cursor-pointer items-center justify-center rounded-[10px] border border-[rgba(150,150,165,0.16)] bg-[rgba(255,255,255,0.05)] text-[18px] leading-none text-white transition-colors hover:bg-[rgba(255,255,255,0.1)]"
    >
      ×
    </button>
  )
  const ShowInFlowToggle = (
    <button
      onClick={() => setShowInFlow((v) => !v)}
      className="flex h-[26px] w-[160px] shrink-0 cursor-pointer items-center justify-between rounded-[15px] border border-[rgba(166,166,166,0.55)] bg-[rgba(14,16,34,0.62)] pl-3 pr-[7px] transition-colors hover:border-[rgba(178,197,242,0.7)]"
    >
      <span className="font-sf text-[14px] text-[#d5d5d5]">Show in Flow</span>
      <span
        className={`flex h-[17px] w-[17px] items-center justify-center rounded-[4px] border-2 transition-colors ${
          showInFlow ? 'border-[#b2c5f2] bg-[#b2c5f2]' : 'border-[#a6a6a6] bg-transparent'
        }`}
      >
        {showInFlow && (
          <svg width="9" height="9" viewBox="0 0 8 8" fill="none">
            <path d="M1 4l2 2 4-4" stroke="#1a1d2e" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
    </button>
  )

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.6)] p-6 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="flex h-[86vh] w-[92vw] max-w-[1500px] flex-col overflow-hidden rounded-[22px] border border-[rgba(255,255,255,0.08)] bg-[rgba(10,11,22,0.94)] shadow-[0px_40px_120px_rgba(0,0,0,0.7)] backdrop-blur-2xl">
        {view === 'diagram' ? (
          <>
            {/* Header */}
            <div className="flex items-start justify-between px-8 pt-7">
              <div className="flex items-start gap-3">
                {FolderIcon}
                <div>
                  <p className="font-sf text-[30px] font-bold leading-tight text-white">Flow Repository</p>
                  <p className="mt-1 font-sf text-[15px] text-[#8d8d97]">
                    Your path with all your Resources, citations, files, etc uploaded in a single place
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {ShowInFlowToggle}
                {CloseBtn}
              </div>
            </div>

            {/* Header divider — thin gradient hairline (Figma Line 10) */}
            <div className="mx-8 mt-5 h-px bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.16)] to-transparent" />

            {/* Controls row — Edit Flow sits top-right (Figma 298:3319) */}
            {flows.length > 0 && showInFlow && (
              <div className="flex justify-end px-8 pt-4">
                <button
                  onClick={toggleEditMode}
                  disabled={saving}
                  className={`h-[26px] cursor-pointer rounded-[15px] border px-4 font-sf text-[14px] transition-colors ${
                    isEditMode
                      ? 'border-[#b2c5f2] bg-[#b2c5f2] font-bold text-[#11131f]'
                      : 'border-[rgba(166,166,166,0.55)] bg-[rgba(14,16,34,0.62)] text-[#d5d5d5] hover:border-[rgba(178,197,242,0.7)]'
                  }`}
                >
                  {saving ? 'Saving…' : isEditMode ? 'Done' : 'Edit Flow'}
                </button>
              </div>
            )}

            {/* Body */}
            <div className="relative flex-1 overflow-auto px-8 pb-8">
              {/* Blue glow background (Figma GRADIENT 1) */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[460px]"
                style={{
                  background:
                    'radial-gradient(58% 52% at 50% 26%, rgba(178,197,242,0.20), rgba(178,197,242,0.07) 45%, transparent 72%)',
                }}
              />

              <div className="relative z-10">
                {flows.length === 0 ? (
                  /* Empty state */
                  <div className="flex h-full min-h-[320px] flex-col items-center justify-center gap-4">
                    <p className="font-sf text-[15px] text-[#5a5a6a]">
                      No flows yet — create one to organise your research
                    </p>
                    {showNewFlowInput ? (
                      <input
                        autoFocus
                        type="text"
                        value={newFlowName}
                        onChange={(e) => setNewFlowName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleAddFlow()
                          if (e.key === 'Escape') {
                            setShowNewFlowInput(false)
                            setNewFlowName('')
                          }
                        }}
                        onBlur={handleAddFlow}
                        placeholder="Flow name…"
                        maxLength={50}
                        className="w-[220px] rounded-[9px] border border-[rgba(178,197,242,0.3)] bg-[rgba(255,255,255,0.05)] px-3 py-2 text-[13px] text-white outline-none placeholder:text-[#4a4a5a]"
                      />
                    ) : (
                      <button
                        onClick={() => setShowNewFlowInput(true)}
                        className="flex cursor-pointer flex-col items-center gap-1"
                      >
                        <span className="flex h-[39px] w-[39px] items-center justify-center">
                          <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
                            <path d="M13 5.4v15.2M5.4 13h15.2" stroke="#cfcfdc" strokeWidth="2.2" strokeLinecap="round" />
                          </svg>
                        </span>
                        <span className="font-sf text-[14.9px] font-bold text-[#cfcfdc]">Add to Flow</span>
                      </button>
                    )}
                  </div>
                ) : showInFlow ? (
                  /* Connected snake diagram — grows horizontally, scrolls sideways */
                  <div className="flex items-center gap-6 pt-10">
                    <div className="min-w-0 flex-1">
                      <HScroll>
                        <div className="flex min-w-full justify-center px-2">
                          <div className="relative" style={{ width: diagramW, height: diagramH }}>
                            {/* Central bus connector (behind the cards) */}
                            <svg className="pointer-events-none absolute inset-0" width={diagramW} height={diagramH}>
                              {topCenters.map((x, i) => (
                                <line key={`t${i}`} x1={x} y1={BUS_Y - BUS_STUB} x2={x} y2={BUS_Y} stroke="rgba(178,197,242,0.45)" strokeWidth="1.5" />
                              ))}
                              {allCenters.length > 0 && (
                                <line x1={busStart} y1={BUS_Y} x2={busEnd} y2={BUS_Y} stroke="rgba(178,197,242,0.45)" strokeWidth="1.5" />
                              )}
                              {botCenters.map((x, i) => (
                                <line key={`b${i}`} x1={x} y1={BUS_Y} x2={x} y2={BUS_Y + BUS_STUB} stroke="rgba(178,197,242,0.45)" strokeWidth="1.5" />
                              ))}
                            </svg>

                            {/* Cards */}
                            {displayFlows.map((flow, index) => {
                              const p = positions[index]
                              return (
                                <div
                                  key={flow.id}
                                  className="absolute"
                                  style={{ left: p.x, top: p.bottom ? p.y - LABEL_GAP : p.y }}
                                >
                                  <FlowNode
                                    flow={flow}
                                    isEditMode={isEditMode}
                                    labelPosition={p.bottom ? 'above' : 'below'}
                                    onDragStart={() => handleDragStart(index)}
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={() => handleDrop(index)}
                                    onClick={() => !isEditMode && openFlow(flow.id)}
                                    onDelete={() => handleDeleteFlow(flow.id)}
                                  />
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      </HScroll>
                    </div>

                    {/* Add to Flow — fixed at the right, always reachable (Figma 298:3395) */}
                    <div className="shrink-0 self-center">
                      {showNewFlowInput ? (
                        <input
                          autoFocus
                          type="text"
                          value={newFlowName}
                          onChange={(e) => setNewFlowName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleAddFlow()
                            if (e.key === 'Escape') {
                              setShowNewFlowInput(false)
                              setNewFlowName('')
                            }
                          }}
                          onBlur={handleAddFlow}
                          placeholder="Flow name…"
                          maxLength={50}
                          className="w-[160px] rounded-[9px] border border-[rgba(178,197,242,0.3)] bg-[rgba(255,255,255,0.05)] px-3 py-2 text-[13px] text-white outline-none placeholder:text-[#4a4a5a]"
                        />
                      ) : (
                        <button
                          onClick={() => setShowNewFlowInput(true)}
                          className="flex cursor-pointer flex-col items-center gap-1"
                        >
                          <span className="flex h-[39px] w-[39px] items-center justify-center transition-transform hover:scale-110">
                            <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
                              <path d="M13 5.4v15.2M5.4 13h15.2" stroke="#cfcfdc" strokeWidth="2.2" strokeLinecap="round" />
                            </svg>
                          </span>
                          <span className="whitespace-nowrap font-sf text-[14.9px] font-bold text-[#cfcfdc]">Add to Flow</span>
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  /* Show in Flow OFF — flat grid of all files (Figma 299:4003) */
                  <div className="pt-6">
                    {allFiles.length === 0 ? (
                      <div className="flex h-[260px] items-center justify-center">
                        <p className="font-sf text-[15px] text-[#5a5a6a]">No files uploaded yet</p>
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-x-[60px] gap-y-[42px]">
                        {allFiles.map((file) => (
                          <FileCard key={file.id} file={file} />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          /* ---- Per-flow files view ---- */
          <>
            <div className="flex items-start justify-between px-8 pt-7">
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <button
                    onClick={() => setView('diagram')}
                    className="cursor-pointer font-sf text-[15px] font-[590] text-[#8d8d97] transition-colors hover:text-white"
                  >
                    Flow Repository
                  </button>
                  <span className="text-[15px] text-[#8d8d97]">›</span>
                  <span className="font-sf text-[15px] font-[590] text-[#d5d5d5]">{selectedFlow?.name}</span>
                </div>
                <p className="font-sf text-[30px] font-bold text-white">{selectedFlow?.name}</p>
              </div>
              <div className="relative flex items-center gap-3">
                <button
                  onClick={() => setShowAddMenu((v) => !v)}
                  className="flex h-[39px] cursor-pointer items-center gap-2 rounded-[9px] border border-[rgba(178,197,242,0.3)] bg-transparent px-4 font-sf text-[13px] text-[#b2c5f2] transition-colors hover:border-[#b2c5f2]"
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M6 1v10M1 6h10" stroke="#b2c5f2" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                  Add Files
                </button>
                {CloseBtn}

                {showAddMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowAddMenu(false)} />
                    <div className="absolute right-12 top-[44px] z-50 w-[240px] overflow-hidden rounded-[13px] border border-[rgba(150,150,165,0.3)] bg-[#0e0e1a] shadow-[0px_20px_60px_rgba(0,0,0,0.6)]">
                      <button
                        onClick={() => {
                          fileInputRef.current?.click()
                          setShowAddMenu(false)
                        }}
                        className="flex w-full cursor-pointer items-center px-5 py-3 text-left font-sf text-[15px] text-white transition-colors hover:bg-[rgba(255,255,255,0.06)]"
                      >
                        Add file from Computer
                      </button>
                      <div className="h-px bg-[rgba(255,255,255,0.07)]" />
                      <button
                        onClick={() => {
                          setShowLinkInput(true)
                          setShowAddMenu(false)
                        }}
                        className="flex w-full cursor-pointer items-center justify-between px-5 py-3 text-left font-sf text-[15px] text-white transition-colors hover:bg-[rgba(255,255,255,0.06)]"
                      >
                        <span>Add a link</span>
                        <span className="text-[13px] text-[#8d8d97] opacity-60">↗</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="mx-8 mt-5 h-px bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.16)] to-transparent" />

            {/* Inline link input */}
            {showLinkInput && (
              <div className="flex items-center gap-3 px-8 pt-6">
                <input
                  autoFocus
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddLink()
                    if (e.key === 'Escape') {
                      setShowLinkInput(false)
                      setLinkUrl('')
                    }
                  }}
                  onBlur={() => {
                    if (!linkUrl.trim()) setShowLinkInput(false)
                  }}
                  placeholder="https://…"
                  className="max-w-[400px] flex-1 rounded-[9px] border border-[rgba(178,197,242,0.3)] bg-[rgba(255,255,255,0.05)] px-4 py-2 text-[14px] text-white outline-none placeholder:text-[#4a4a5a]"
                />
                <button
                  onClick={handleAddLink}
                  className="cursor-pointer rounded-[9px] bg-[#b2c5f2] px-4 py-2 text-[13px] font-bold text-black"
                >
                  Add
                </button>
              </div>
            )}

            {/* Files grid */}
            <div className="flex-1 overflow-auto px-8 pb-8 pt-6">
              {!selectedFlow?.files || selectedFlow.files.length === 0 ? (
                <div className="flex h-[200px] items-center justify-center">
                  <p className="font-sf text-[14px] text-[#5a5a6a]">No files in this flow yet — use “Add Files”</p>
                </div>
              ) : (
                <div className="flex flex-wrap gap-x-[60px] gap-y-[42px]">
                  {selectedFlow.files.map((file) => (
                    <FileCard key={file.id} file={file} />
                  ))}
                </div>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.txt,.ppt,.pptx,.xls,.xlsx,.png,.jpg,.jpeg,.gif,.webp"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) handleAddFile(e.target.files[0])
              }}
            />
          </>
        )}
      </div>
    </div>
  )
}
