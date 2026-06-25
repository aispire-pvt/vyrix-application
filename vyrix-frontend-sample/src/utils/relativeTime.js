// Format an ISO date string as a short relative "Edited …" label.
export function relativeTime(dateString) {
  if (!dateString) return ''
  const diff = Date.now() - new Date(dateString).getTime()
  if (diff < 0) return 'Just now' // clock skew
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `Edited ${mins}m ago`
  if (hours < 24) return `Edited ${hours}hr${hours > 1 ? 's' : ''} ago`
  if (days < 30) return `Edited ${days}d ago`
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}
