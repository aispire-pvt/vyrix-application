import { useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import FlowNode from './FlowNode'
import { flows as flowsApi } from '../../api/local'

// Props: { projectId, flows, onReordered, onAddFlow }
export default function FlowDiagram({ projectId, flows = [], onReordered, onAddFlow }) {
  const navigate = useNavigate()
  const [isEditMode, setIsEditMode] = useState(false)
  const [localFlows, setLocalFlows] = useState(flows)
  const dragIndexRef = useRef(null)
  const autoSaveTimerRef = useRef(null)
  const [saving, setSaving] = useState(false)

  const [showNewFlowInput, setShowNewFlowInput] = useState(false)
  const [newFlowName, setNewFlowName] = useState('')

  // Use the local copy while editing; otherwise mirror the parent's flows.
  const displayFlows = isEditMode ? localFlows : flows

  const handleDragStart = (index) => {
    dragIndexRef.current = index
  }

  const autoSave = useCallback((reordered) => {
    clearTimeout(autoSaveTimerRef.current)
    autoSaveTimerRef.current = setTimeout(async () => {
      try {
        setSaving(true)
        await flowsApi.reorder(projectId, reordered.map((f) => f.id))
        onReordered?.(reordered)
      } catch {
        // revert if save fails
        setLocalFlows([...flows])
      } finally {
        setSaving(false)
      }
    }, 300)
  }, [projectId, flows, onReordered])

  const handleDrop = (dropIndex) => {
    const dragIndex = dragIndexRef.current
    if (dragIndex === null || dragIndex === dropIndex) return
    const reordered = [...localFlows]
    const [removed] = reordered.splice(dragIndex, 1)
    reordered.splice(dropIndex, 0, removed)
    setLocalFlows(reordered)
    dragIndexRef.current = null
    if (isEditMode) autoSave(reordered)
  }

  const toggleEditMode = async () => {
    if (isEditMode) {
      // Save the new order
      setSaving(true)
      try {
        await flowsApi.reorder(projectId, localFlows.map((f) => f.id))
        onReordered?.(localFlows)
      } catch (err) {
        console.error('Failed to save flow order:', err)
        setLocalFlows(flows) // revert
      } finally {
        setSaving(false)
      }
    } else {
      // Enter edit mode — sync local copy
      setLocalFlows([...flows])
    }
    setIsEditMode((v) => !v)
  }

  const handleAddFlow = async () => {
    const name = newFlowName.trim() || 'New Flow'
    try {
      const flow = await flowsApi.create(projectId, name)
      onAddFlow?.(flow)
    } catch (err) {
      console.error('Failed to add flow:', err)
    } finally {
      setShowNewFlowInput(false)
      setNewFlowName('')
    }
  }

  return (
    <div className="mt-4 w-full rounded-[20px] border border-[rgba(178,197,242,0.08)] bg-[rgba(14,15,28,0.8)] p-6">
      {/* Header row */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="font-unbounded text-[22px] font-medium text-white">Flow Repository</p>
          <p className="mt-1 text-[13px] text-[#8d8d97]">
            Your path with all your Resources, citations, files, etc.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Edit Flow button */}
          <button
            onClick={toggleEditMode}
            disabled={saving}
            className={`cursor-pointer rounded-[9px] border px-4 py-2 text-[13px] font-bold transition-colors ${
              isEditMode
                ? 'border-[#b2c5f2] bg-[#b2c5f2] text-black'
                : 'border-[rgba(178,197,242,0.3)] bg-transparent text-white hover:border-[#b2c5f2]'
            }`}
          >
            {saving ? 'Saving...' : isEditMode ? 'Done' : 'Edit Flow'}
          </button>
        </div>
      </div>

      {/* Flows — empty state */}
      {displayFlows.length === 0 ? (
        <div className="flex h-[120px] items-center justify-center rounded-[16px] border border-dashed border-[rgba(178,197,242,0.15)]">
          <p className="text-[14px] text-[#4a4a5a]">No flows yet</p>
        </div>
      ) : (
        /* Flow nodes in a row with connecting lines */
        <div className="relative">
          <div className="flex items-center gap-0 overflow-x-auto pb-4">
            {displayFlows.map((flow, index) => (
              <div key={flow.id} className="flex flex-shrink-0 items-center">
                <FlowNode
                  flow={flow}
                  isEditMode={isEditMode}
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleDrop(index)}
                  onClick={() =>
                    !isEditMode && navigate(`/project/${projectId}/flow/${flow.id}`)
                  }
                />
                {/* Connecting line between nodes */}
                {index < displayFlows.length - 1 && (
                  <div className="flex w-[40px] flex-shrink-0 items-center">
                    <div className="h-[1px] w-full bg-[rgba(178,197,242,0.3)]" />
                    <div className="h-0 w-0 flex-shrink-0 border-b-[4px] border-l-[6px] border-t-[4px] border-b-transparent border-l-[rgba(178,197,242,0.3)] border-t-transparent" />
                  </div>
                )}
              </div>
            ))}

            {/* Add to Flow */}
            {showNewFlowInput ? (
              <div className="ml-4 flex flex-shrink-0 items-center">
                <div className="flex w-[40px] items-center">
                  <div className="h-[1px] w-full bg-[rgba(178,197,242,0.2)]" />
                </div>
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
                  placeholder="Flow name..."
                  maxLength={50}
                  className="w-[180px] rounded-[9px] border border-[rgba(178,197,242,0.3)] bg-[rgba(255,255,255,0.05)] px-3 py-2 text-[13px] text-white outline-none placeholder:text-[#4a4a5a]"
                />
              </div>
            ) : (
              <div className="ml-0 flex flex-shrink-0 items-center">
                {displayFlows.length > 0 && (
                  <div className="flex w-[40px] items-center">
                    <div className="h-[1px] w-full bg-[rgba(178,197,242,0.2)]" />
                  </div>
                )}
                <button
                  onClick={() => setShowNewFlowInput(true)}
                  className="flex h-[39px] flex-shrink-0 cursor-pointer items-center gap-2 whitespace-nowrap rounded-[9px] border border-dashed border-[rgba(178,197,242,0.3)] bg-transparent px-4 text-[13px] text-[#b2c5f2] transition-colors hover:border-[#b2c5f2]"
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M6 1v10M1 6h10" stroke="#b2c5f2" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                  Add to Flow
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
