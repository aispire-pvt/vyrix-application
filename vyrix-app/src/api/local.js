// Thin wrappers around window.vyrix IPC surface.
// Replaces all axios calls for projects / folders / todos / attachments / flows.
// All functions return Promises (ipcRenderer.invoke is already async).

const w = window.vyrix

export const getMe     = ()        => w.getMe()
export const logout    = ()        => w.logout()
export const heartbeat = (v)       => w.heartbeat(v)
export const logUsage  = (c)       => w.logUsage(c)

export const projects    = w.projects
export const folders     = w.folders
export const todos       = w.todos
export const attachments = w.attachments
export const flows       = w.flows
