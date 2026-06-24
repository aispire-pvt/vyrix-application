import docCover from '../../assets/flow/doc-cover.png'
import FileTypeIcon, { normalizeType } from './FileTypeIcon'

// Figma's five-shape mark, drawn so the figma cover looks branded.
function FigmaMark({ size = 46 }) {
  return (
    <svg width={size * 0.66} height={size} viewBox="0 0 38 57" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M19 28.5a9.5 9.5 0 1 1 19 0 9.5 9.5 0 0 1-19 0Z" fill="#1abcfe" />
      <path d="M0 47.5A9.5 9.5 0 0 1 9.5 38H19v9.5a9.5 9.5 0 1 1-19 0Z" fill="#0acf83" />
      <path d="M19 0v19h9.5a9.5 9.5 0 1 0 0-19H19Z" fill="#ff7262" />
      <path d="M0 9.5A9.5 9.5 0 0 0 9.5 19H19V0H9.5A9.5 9.5 0 0 0 0 9.5Z" fill="#f24e1e" />
      <path d="M0 28.5A9.5 9.5 0 0 0 9.5 38H19V19H9.5A9.5 9.5 0 0 0 0 28.5Z" fill="#a259ff" />
    </svg>
  )
}

// A large 16:10 cover for the Documents grid. Each file type gets a tailored,
// polished look instead of a blank card.
export default function DocumentCover({ att }) {
  const t = normalizeType(att?.type, att?.name)
  const base =
    'relative flex h-full w-full items-center justify-center overflow-hidden rounded-[16px] border border-[rgba(255,255,255,0.06)]'

  // Real image preview.
  if (t === 'image' && att?.url) {
    return (
      <div className={base + ' bg-[#111118]'}>
        <img src={att.url} alt="" className="h-full w-full object-cover" />
      </div>
    )
  }

  // A created document — show the document-preview cover.
  if (t === 'document') {
    return (
      <div className={base + ' bg-white'}>
        <img src={docCover} alt="" className="absolute left-0 w-full max-w-none object-cover" style={{ height: '228.91%', top: '-30%' }} />
      </div>
    )
  }

  // Figma — dark cover with the Figma mark.
  if (t === 'figma') {
    return (
      <div className={base} style={{ background: 'radial-gradient(120% 120% at 50% 0%, #2c2c2c, #0d0d0d)' }}>
        <FigmaMark size={52} />
      </div>
    )
  }

  // FigJam — warm gradient with the wordmark.
  if (t === 'figjam') {
    return (
      <div className={base} style={{ background: 'linear-gradient(135deg, #ff7237, #a259ff)' }}>
        <span className="font-sf text-[20px] font-bold tracking-tight text-white">FigJam</span>
      </div>
    )
  }

  // Canva — teal→purple gradient with the wordmark.
  if (t === 'canva') {
    return (
      <div className={base} style={{ background: 'linear-gradient(120deg, #00c4cc, #6420ff)' }}>
        <span className="font-sf text-[22px] font-bold tracking-tight text-white">Canva</span>
      </div>
    )
  }

  // Link — dark cover with the colourful link icon and the domain.
  if (t === 'link') {
    let host = att?.url || ''
    try {
      host = new URL(att.url).hostname.replace('www.', '')
    } catch {
      /* keep raw */
    }
    return (
      <div className={base + ' flex-col gap-2 bg-[#111118]'}>
        <FileTypeIcon type="link" size={48} />
        <span className="max-w-[160px] truncate px-2 text-[11px] text-[#8d8d97]">{host}</span>
      </div>
    )
  }

  // pdf / word / text / ppt / excel / generic — centred type icon on a soft bg.
  return (
    <div className={base} style={{ background: 'linear-gradient(160deg, #15161f, #0e0f17)' }}>
      <FileTypeIcon type={att?.type} name={att?.name} size={62} />
    </div>
  )
}
