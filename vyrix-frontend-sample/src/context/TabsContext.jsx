import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

// Global, persistent browser-style tabs shared by the Navbar across pages.
// Each tab has a unique id and its own current { path, title }. Like a browser:
//  - "+" opens a NEW tab (lands on Home) — duplicates allowed.
//  - navigating (open a project, click a sidebar item) changes the ACTIVE tab in place.
//  - the active tab is tracked by id (not path), so multiple Home tabs can coexist.
const TabsContext = createContext(null)
const STORAGE_KEY = 'vyrix_tabs'

const genId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6)

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed.tabs)) return parsed
    }
  } catch {
    /* ignore */
  }
  return { tabs: [], activeId: null }
}

export function TabsProvider({ children }) {
  const navigate = useNavigate()
  const initial = loadState()
  const [tabs, setTabs] = useState(initial.tabs)
  const [activeId, setActiveId] = useState(initial.activeId)

  // Keep refs in sync each render so the stable callbacks below read latest state.
  const tabsRef = useRef(tabs)
  const activeRef = useRef(activeId)
  tabsRef.current = tabs
  activeRef.current = activeId

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ tabs, activeId }))
    } catch {
      /* ignore */
    }
  }, [tabs, activeId])

  // Make the active tab reflect the current route (called by the Navbar on nav).
  const syncActive = useCallback((path, title) => {
    const list = tabsRef.current
    const active = list.find((t) => t.id === activeRef.current)
    if (active) {
      if (active.path !== path || active.title !== title) {
        setTabs(list.map((t) => (t.id === active.id ? { ...t, path, title } : t)))
      }
      return
    }
    // No active tab yet — adopt an existing tab for this path, or create one.
    const match = list.find((t) => t.path === path)
    if (match) {
      setActiveId(match.id)
      return
    }
    const id = genId()
    setTabs([...list, { id, path, title }])
    setActiveId(id)
  }, [])

  // "+" — open a fresh Home tab and switch to it.
  const newTab = useCallback(() => {
    const id = genId()
    setTabs((prev) => [...prev, { id, path: '/home', title: 'Home' }])
    setActiveId(id)
    navigate('/home')
  }, [navigate])

  const selectTab = useCallback(
    (id) => {
      const tab = tabsRef.current.find((t) => t.id === id)
      if (!tab) return
      setActiveId(id)
      navigate(tab.path)
    },
    [navigate]
  )

  const closeTab = useCallback(
    (id) => {
      const list = tabsRef.current
      const idx = list.findIndex((t) => t.id === id)
      const next = list.filter((t) => t.id !== id)
      if (id !== activeRef.current) {
        setTabs(next)
        return
      }
      // Closed the active tab — move to a neighbour, or seed a fresh Home tab.
      if (next.length === 0) {
        const nid = genId()
        setTabs([{ id: nid, path: '/home', title: 'Home' }])
        setActiveId(nid)
        navigate('/home')
        return
      }
      const neighbour = next[Math.max(0, idx - 1)]
      setTabs(next)
      setActiveId(neighbour.id)
      navigate(neighbour.path)
    },
    [navigate]
  )

  return (
    <TabsContext.Provider value={{ tabs, activeId, syncActive, newTab, selectTab, closeTab }}>
      {children}
    </TabsContext.Provider>
  )
}

export function useTabs() {
  return useContext(TabsContext)
}
