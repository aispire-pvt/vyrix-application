import { useEffect, useRef, useState } from 'react'
import { todos as todosApi } from '../../api/local'

function PlusIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 22 22" fill="none">
      <path d="M11 4v14M4 11h14" stroke="#b2c5f2" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  )
}

function SectionLabel({ children }) {
  return <p className="mt-2 text-[13px] font-bold tracking-wide text-[#d5d5d5]">{children}</p>
}

export default function TodoPanel({ isOpen, onClose, firstName }) {
  const [tasks, setTasks]   = useState([])
  const [newTask, setNewTask] = useState('')
  const [loading, setLoading] = useState(true)
  const inputRef = useRef(null)

  useEffect(() => {
    if (!isOpen) return
    let active = true
    setLoading(true)
    todosApi.list()
      .then((rows) => { if (active) setTasks(rows) })
      .catch((err) => console.error('Failed to load todos:', err))
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [isOpen])

  if (!isOpen) return null

  const addTask = async () => {
    const text = newTask.trim()
    if (!text) return
    setNewTask('')
    try {
      const todo = await todosApi.create(text)
      setTasks((prev) => [...prev, todo])
      inputRef.current?.focus()
    } catch (err) { console.error('Failed to add todo:', err) }
  }

  const toggleTask = async (task) => {
    setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, done: !t.done } : t)))
    try {
      await todosApi.update(task.id, { done: !task.done })
    } catch {
      setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, done: task.done } : t)))
    }
  }

  const deleteTask = async (id) => {
    const prev = tasks
    setTasks((p) => p.filter((t) => t.id !== id))
    try { await todosApi.delete(id) }
    catch { setTasks(prev) }
  }

  const ongoing   = tasks.filter((t) => !t.done)
  const completed = tasks.filter((t) => t.done)
  const total     = tasks.length

  return (
    <div className="absolute right-0 top-0 z-50 mr-4 mt-[93px] flex h-[543px] w-[415px] flex-col gap-4 rounded-[18px] bg-[#0e0e1a] p-[25px] shadow-2xl">
      <div className="flex items-start justify-between">
        <h2 className="font-unbounded text-[28px] font-medium text-white">My To-Do</h2>
        <button type="button" onClick={onClose} className="cursor-pointer text-[20px] text-[#8d8d97] hover:text-white" aria-label="Close">×</button>
      </div>

      <div className="h-[1px] w-full bg-[rgba(255,255,255,0.1)]" />

      <div className="flex items-center gap-3">
        <div className="flex h-[41px] w-[41px] flex-shrink-0 items-center justify-center rounded-full border-2 border-[#b2c5f2]">
          <span className="text-[11px] font-bold text-[#b2c5f2]">{completed.length}/{total}</span>
        </div>
        <p className="text-[14px] text-[#d5d5d5]">
          {total === 0 ? `Add your first task, ${firstName || 'there'}!` : `done already - Keep Going ${firstName || 'there'}!`}
        </p>
      </div>

      <div className="flex h-[35px] w-full items-center gap-2 rounded-[11px] border border-[rgba(178,197,242,0.2)] bg-[rgba(178,197,242,0.08)] px-3">
        <button type="button" onClick={addTask} className="flex cursor-pointer items-center" aria-label="Add task"><PlusIcon /></button>
        <input ref={inputRef} type="text" value={newTask} onChange={(e) => setNewTask(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') addTask() }}
          placeholder="Add new task" maxLength={120}
          className="min-w-0 flex-1 bg-transparent text-[14px] text-white outline-none placeholder:text-[#8d8d97]"
        />
      </div>

      <div className="flex flex-1 flex-col gap-1 overflow-y-auto">
        {loading ? (
          <p className="mt-4 text-center text-[13px] text-[#4a4a5a]">Loading…</p>
        ) : total === 0 ? (
          <p className="mt-4 text-center text-[13px] text-[#4a4a5a]">No tasks yet — add one above.</p>
        ) : (
          <>
            {ongoing.length > 0 && <SectionLabel>Ongoing</SectionLabel>}
            {ongoing.map((task) => (
              <div key={task.id} className="group flex items-center gap-3 py-1">
                <button type="button" onClick={() => toggleTask(task)} className="h-[17px] w-[17px] flex-shrink-0 cursor-pointer rounded-[3px] border border-[rgba(178,197,242,0.4)] bg-transparent transition-colors hover:border-[#b2c5f2]" />
                <button type="button" onClick={() => toggleTask(task)} className="flex-1 cursor-pointer truncate text-left text-[14px] text-[#d5d5d5]">{task.text}</button>
                <button type="button" onClick={() => deleteTask(task.id)} className="flex-shrink-0 cursor-pointer text-[#5a5a6a] opacity-0 transition-opacity hover:text-[#b80407] group-hover:opacity-100"><TrashIcon /></button>
              </div>
            ))}
            {completed.length > 0 && <SectionLabel>Completed</SectionLabel>}
            {completed.map((task) => (
              <div key={task.id} className="group flex items-center gap-3 py-1">
                <button type="button" onClick={() => toggleTask(task)} className="flex h-[17px] w-[17px] flex-shrink-0 cursor-pointer items-center justify-center rounded-[3px] border border-[#b2c5f2] bg-[#b2c5f2] text-[10px] font-bold text-black">✓</button>
                <button type="button" onClick={() => toggleTask(task)} className="flex-1 cursor-pointer truncate text-left text-[14px] text-[#8d8d97] line-through">{task.text}</button>
                <button type="button" onClick={() => deleteTask(task.id)} className="flex-shrink-0 cursor-pointer text-[#5a5a6a] opacity-0 transition-opacity hover:text-[#b80407] group-hover:opacity-100"><TrashIcon /></button>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  )
}
