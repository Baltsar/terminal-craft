import { useEffect, useRef, useState } from 'react'
import type { GlyphAnimation } from '../data/glyphAnimations'
import { SpinnerGlyph } from './SpinnerGlyph'

interface GlyphCardProps {
  item: GlyphAnimation
  onCopyData: (text: string) => void
  onCopyUsage: (text: string) => void
  onAddToMockup?: (item: GlyphAnimation, speed?: number) => void
}

function escapeForJs(c: string): string {
  let out = "'"
  for (const ch of [...c]) {
    const code = ch.codePointAt(0) ?? 0
    if (ch === '\\') out += '\\\\'
    else if (ch === "'") out += "\\'"
    else if (code < 32 || code === 0x7f) out += '\\x' + code.toString(16).padStart(2, '0')
    else if (code > 127) out += code <= 0xffff ? '\\u' + code.toString(16).padStart(4, '0') : '\\u{' + code.toString(16) + '}'
    else out += ch
  }
  return out + "'"
}

const SPEED_OPTIONS = [80, 120, 200]

export function GlyphCard({ item, onCopyData, onCopyUsage, onAddToMockup }: GlyphCardProps) {
  const [showCopiedToast, setShowCopiedToast] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [speed, setSpeed] = useState(200)
  const [helpOpen, setHelpOpen] = useState(false)
  const cardRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!showPreview) return
    const close = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node
      if (cardRef.current && !cardRef.current.contains(target)) setShowPreview(false)
    }
    document.addEventListener('mousedown', close)
    document.addEventListener('touchstart', close, { passive: true })
    return () => {
      document.removeEventListener('mousedown', close)
      document.removeEventListener('touchstart', close)
    }
  }, [showPreview])

  const dataSnippet = `  ${item.id}: [${item.chars.map(escapeForJs).join(',')}],`
  const usageSnippet = `// ${item.id}
const chars = [${item.chars.map(escapeForJs).join(',')}];
let i = 0;
const id = setInterval(() => {
  element.textContent = chars[i % chars.length];
  i++;
}, ${speed});
// stop: clearInterval(id);`

  const showToast = () => {
    setShowCopiedToast(true)
    setTimeout(() => setShowCopiedToast(false), 1400)
  }

  const handleCopyData = () => {
    navigator.clipboard.writeText(dataSnippet)
      .then(() => {
        showToast()
      })
      .catch(() => {})
    onCopyData(dataSnippet)
  }

  const handleCopyUsage = () => {
    navigator.clipboard.writeText(usageSnippet)
      .then(() => {
        showToast()
      })
      .catch(() => {})
    onCopyUsage(usageSnippet)
  }

  const handleAddToMockup = () => {
    onAddToMockup?.(item, speed)
    document.getElementById('terminal-mockup')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <article ref={cardRef} className="sg-card" data-variant={item.id} data-category={item.category}>
      <button
        type="button"
        className="sg-card-tweak"
        onClick={() => setShowPreview((o) => !o)}
        title="Justera hastighet – speglas i preview, Copy usage och mockup"
        aria-label="Tweak animation (hastighet)"
        aria-expanded={showPreview}
      >
        <span className="sg-card-tweak-icon" aria-hidden>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
        </span>
      </button>
      <div className="sg-card-demo">
        <SpinnerGlyph chars={item.chars} speed={speed} />
      </div>
      <div className="sg-card-name-wrap">
        <span className="sg-card-name">{item.name}</span>
        {item.description && (
          <span className="sg-card-help-wrap">
            <button
              type="button"
              className="sg-card-help"
              onClick={() => setHelpOpen((o) => !o)}
              onBlur={() => setHelpOpen(false)}
              aria-label="Beskrivning"
              aria-expanded={helpOpen}
            >
              ?
            </button>
            <span className={`sg-card-tooltip ${helpOpen ? 'visible' : ''}`} role="tooltip">
              {item.description}
            </span>
          </span>
        )}
      </div>
      <div className="sg-card-actions">
        <button
          type="button"
          className="sg-copy-btn"
          onClick={handleCopyData}
        >
          Copy data
        </button>
        <button
          type="button"
          className="sg-copy-btn"
          onClick={handleCopyUsage}
        >
          Copy usage
        </button>
        <button
          type="button"
          className="sg-copy-btn"
          onClick={handleAddToMockup}
          title="Lägg till i terminal mockup"
        >
          + Mockup
        </button>
      </div>
      {showCopiedToast && (
        <div className="sg-copy-toast" role="status" aria-live="polite">
          Copied
        </div>
      )}
      {showPreview && (
        <div className="sg-card-speed-popover" role="dialog" aria-label="Hastighet">
          <div className="sg-card-copy-preview-speed">
            <span className="sg-card-copy-preview-label">Speed</span>
            <div className="sg-card-speed-options">
              {SPEED_OPTIONS.map((ms) => (
                <button
                  key={ms}
                  type="button"
                  className={`sg-card-speed-btn ${speed === ms ? 'active' : ''}`}
                  onClick={() => setSpeed(ms)}
                >
                  {ms}ms
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </article>
  )
}
