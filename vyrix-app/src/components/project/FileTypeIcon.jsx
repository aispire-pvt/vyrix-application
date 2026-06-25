import iconPdf from '../../assets/flow/icon-pdf.png'
import iconPhoto from '../../assets/flow/icon-photo.png'
import iconLink from '../../assets/flow/icon-link.png'

// Resolve a stored type + filename to one canonical kind so the right icon shows.
export function normalizeType(type = '', name = '') {
  const t = (type || '').toLowerCase()
  const ext = (name.split('.').pop() || '').toLowerCase()
  if (t === 'image' || ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'bmp', 'heic'].includes(ext)) return 'image'
  if (t === 'pdf' || ext === 'pdf') return 'pdf'
  if (t === 'link') return 'link'
  if (t === 'canva') return 'canva'
  if (t === 'figma') return 'figma'
  if (t === 'figjam') return 'figjam'
  if (t === 'document') return 'document'
  if (t === 'word' || ['doc', 'docx'].includes(ext)) return 'word'
  if (t === 'ppt' || ['ppt', 'pptx'].includes(ext)) return 'ppt'
  if (t === 'excel' || ['xls', 'xlsx', 'csv'].includes(ext)) return 'excel'
  if (t === 'text' || ['txt', 'md', 'rtf'].includes(ext)) return 'text'
  return 'file'
}

// Coloured badge shown on the generic document icon, per type.
const BADGE = {
  word: { label: 'DOC', color: '#2b7cd3' },
  document: { label: 'DOC', color: '#2b7cd3' },
  text: { label: 'TXT', color: '#5b6472' },
  ppt: { label: 'PPT', color: '#e8662a' },
  excel: { label: 'XLS', color: '#1f9d57' },
  canva: { label: 'CV', color: '#7d2ae8' },
  figma: { label: 'FIG', color: '#a259ff' },
  figjam: { label: 'JAM', color: '#ff7237' },
  file: { label: 'FILE', color: '#6b7280' },
}

// A small, square file-type icon. image/pdf/link use the colourful Figma assets;
// everything else renders a clean document glyph with a coloured type badge.
export default function FileTypeIcon({ type, name, size = 88, className = '' }) {
  const t = normalizeType(type, name)

  if (t === 'image') return <img src={iconPhoto} alt="" width={size} height={size} className={`object-contain ${className}`} />
  if (t === 'pdf') return <img src={iconPdf} alt="" width={size} height={size} className={`object-contain ${className}`} />
  if (t === 'link') return <img src={iconLink} alt="" width={size} height={size} className={`object-contain ${className}`} />

  const badge = BADGE[t] || BADGE.file
  return (
    <svg width={size} height={size} viewBox="0 0 80 96" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <path
        d="M14 3 H50 L69 22 V89 a4 4 0 0 1 -4 4 H14 a4 4 0 0 1 -4 -4 V7 a4 4 0 0 1 4 -4 Z"
        fill="#eef1f6"
        stroke="#d7dbe3"
        strokeWidth="1.5"
      />
      <path d="M50 3 V18 a4 4 0 0 0 4 4 H69 Z" fill="#cdd3dd" />
      {/* faint body lines */}
      <g stroke="#c9cfda" strokeWidth="2.5" strokeLinecap="round">
        <line x1="20" y1="34" x2="58" y2="34" />
        <line x1="20" y1="42" x2="58" y2="42" />
      </g>
      <rect x="15" y="52" width="50" height="22" rx="4" fill={badge.color} />
      <text x="40" y="67" textAnchor="middle" fontSize="12.5" fontWeight="700" fontFamily="Arial, sans-serif" fill="#ffffff">
        {badge.label}
      </text>
    </svg>
  )
}
