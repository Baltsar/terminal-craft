import { SpinnerGlyph } from './SpinnerGlyph'
import { allGlyphAnimations } from '../data/glyphAnimations'
import type { DropItem } from '../canvas/types'
import { formatPanelContent, formatFrameTitle } from '../utils/tuiFormat'
import { useLanguage } from '../context/LanguageContext'

interface TUIPreviewContentProps {
  items: DropItem[]
  className?: string
  /** When true, show tap/click hint instead of "drag from the left" (Canvas 2.0) */
  useCanvas2EmptyHint?: boolean
}

export function TUIPreviewContent({ items, className = '', useCanvas2EmptyHint }: TUIPreviewContentProps) {
  const { t } = useLanguage()
  const emptyHint = useCanvas2EmptyHint ? t('tui.previewEmptyHint') : t('canvas.emptyHint')
  return (
    <div className={`tui-preview-content ${className}`}>
      <div className="tui-preview-line tui-preview-prompt">{t('tui.prompt')}</div>
      <div className="tui-preview-line tui-preview-prompt">&gt; {t('tui.subtitle')}</div>
      {items.length === 0 && (
        <div className="tui-preview-line tui-preview-muted">  ({emptyHint})</div>
      )}
      {items.map((item) => (
        <TUIBlock key={item.id} item={item} />
      ))}
      <div className="tui-preview-cursor" />
    </div>
  )
}

function TUIBlock({ item }: { item: DropItem }) {
  const glyph = item.glyphId
    ? allGlyphAnimations.find((g) => g.id === item.glyphId)
    : null

  if (item.type === 'confirm') {
    return (
      <div className="tui-preview-block">
        <span className="tui-preview-prompt">{item.confirmPrompt ?? 'Continue?'}</span>
        <span className="tui-preview-confirm"> (J/N)</span>
      </div>
    )
  }
  if (item.type === 'panel') {
    const content = formatPanelContent(item.panelContent ?? 'Content')
    return (
      <div className="tui-preview-block">
        <div className="tui-preview-panel">
          <div className="tui-preview-line">┌─ Panel ─────────────┐</div>
          <div className="tui-preview-line">│ {content} │</div>
          <div className="tui-preview-line">└─────────────────────┘</div>
        </div>
      </div>
    )
  }
  if (item.type === 'frame') {
    const title = formatFrameTitle(item.frameTitle ?? '')
    const top = `┌─ ${title} ─${'─'.repeat(Math.max(0, 11 - title.length))}┐`
    return (
      <div className="tui-preview-block">
        <div className="tui-preview-panel">
          <div className="tui-preview-line">{top}</div>
          <div className="tui-preview-line">│                     │</div>
          <div className="tui-preview-line">└─────────────────────┘</div>
        </div>
      </div>
    )
  }
  if (item.type === 'text') {
    return (
      <div className="tui-preview-block">
        <span className="tui-preview-text">{item.textContent ?? 'Sample text'}</span>
      </div>
    )
  }
  if (item.type === 'button') {
    return (
      <div className="tui-preview-block">
        <span className="tui-preview-accent">[ {item.buttonLabel ?? 'Button'} ]</span>
      </div>
    )
  }
  if (item.type === 'spinner') {
    return (
      <div className="tui-preview-block tui-preview-inline">
        <SpinnerGlyph chars={['|', '/', '-', '\\']} speed={item.speedMs ?? 200} />
        <span className="tui-preview-muted"> {item.glyphLabel ?? 'Working…'}</span>
      </div>
    )
  }
  if (item.type === 'progress') {
    return (
      <div className="tui-preview-block">
        <div className="tui-preview-inline">
          <span className="tui-preview-bar">▰▰▰▰▰▱▱▱▱▱</span>
          <span className="tui-preview-muted"> 50%</span>
        </div>
      </div>
    )
  }
  if (item.type === 'agentic-feed') {
    return (
      <div className="tui-preview-block">
        <div className="tui-preview-line">▸ Thinking…</div>
        <div className="tui-preview-line">▸ Running tool</div>
      </div>
    )
  }
  if (item.type === 'multi-agent') {
    return (
      <div className="tui-preview-block">
        <div className="tui-preview-line">Researcher ●</div>
        <div className="tui-preview-line">Judge ○</div>
      </div>
    )
  }
  if (item.type === 'glyph' && glyph) {
    return (
      <div className="tui-preview-block tui-preview-inline">
        <SpinnerGlyph chars={glyph.chars} speed={item.speedMs ?? 200} />
        <span className="tui-preview-muted"> {item.glyphLabel ?? glyph.name}</span>
      </div>
    )
  }
  return null
}
