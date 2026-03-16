import { useCallback, useEffect, useRef, useState } from 'react'
import { DndProvider, useDrag, useDrop } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { TUIPreviewContent } from './TUIPreviewContent'
import { SpinnerGlyph } from './SpinnerGlyph'
import { allGlyphAnimations, categoryLabels, CATEGORY_ORDER, type GlyphCategory } from '../data/glyphAnimations'
import { useLanguage } from '../context/LanguageContext'
import type { DropItem, DropItemType } from '../canvas/types'
import { INITIAL_DROPPED, createDropItem } from '../canvas/types'
import { buildCopyCode } from '../canvas/buildCode'

/** TUI building blocks (mirrors main page: primitives + UI blocks, no glyph library here) */
const BLOCKS: { type: string; label: string; preview: string }[] = [
  { type: 'confirm', label: 'Confirm (J/N)', preview: 'J/N' },
  { type: 'text', label: 'Text', preview: 'Aa' },
  { type: 'spinner', label: 'Spinner', preview: '|/-\\' },
  { type: 'progress', label: 'Progress', preview: '▰▰▱▱▱' },
  { type: 'panel', label: 'Panel', preview: '┌─┐' },
  { type: 'frame', label: 'Frame', preview: '┌─┐' },
  { type: 'button', label: 'Button', preview: '[ ]' },
  { type: 'agentic-feed', label: 'Agentic Feed', preview: '▸ …' },
  { type: 'multi-agent', label: 'Multi-agent block', preview: '●○' },
]

type PaletteTab = 'blocks' | 'glyphs'

/** Re-export for consumers that import from CanvasView */
export type { DropItem, DropItemType }

// ── Mini inline preview ────────────────────────────────────────────────────
function InlinePreview({ type, glyphId }: { type: string; glyphId?: string }) {
  const glyph = glyphId ? allGlyphAnimations.find((g) => g.id === glyphId) : null
  if (type === 'spinner') return <SpinnerGlyph chars={['|','/','-','\\']} speed={200} className="palette-preview" />
  if (type === 'glyph' && glyph) return <SpinnerGlyph chars={glyph.chars} speed={200} className="palette-preview" />
  const staticMap: Record<string, string> = {
    confirm: 'J/N', text: 'Aa', progress: '▰▰▱▱▱', panel: '┌─┐', frame: '┌─┐', button: '[ ]',
    'agentic-feed': '▸ …', 'multi-agent': '●○',
  }
  const text = staticMap[type]
  return text ? <span className="palette-preview">{text}</span> : null
}

// ── Draggable card ─────────────────────────────────────────────────────────
function PaletteCard({ type, label, glyphId }: { type: string; label: string; glyphId?: string }) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'palette-item',
    item: { type, label, glyphId },
    collect: (m) => ({ isDragging: m.isDragging() }),
  }))
  return (
    <div ref={drag} className="palette-card" style={{ opacity: isDragging ? 0.4 : 1 }}>
      <span className="palette-card-label">{label}</span>
      <InlinePreview type={type} glyphId={glyphId} />
    </div>
  )
}

// ── Builder drop zone ──────────────────────────────────────────────────────
type EditField = 'textContent' | 'panelContent' | 'confirmPrompt' | 'frameTitle' | 'buttonLabel' | 'glyphLabel'

function BuilderList({ items, onRemove, onDrop, onMoveUp, onMoveDown, onEditText, onEditPanelContent, onEditConfirmPrompt, onEditFrameTitle, onEditButtonLabel, onEditGlyphLabel, onEditSpeed, t }: {
  items: DropItem[]
  onRemove: (id: string) => void
  onDrop: (dragItem: { type: string; label: string; glyphId?: string }) => void
  onMoveUp: (index: number) => void
  onMoveDown: (index: number) => void
  onEditText: (id: string, text: string) => void
  onEditPanelContent: (id: string, text: string) => void
  onEditConfirmPrompt: (id: string, text: string) => void
  onEditFrameTitle: (id: string, text: string) => void
  onEditButtonLabel: (id: string, text: string) => void
  onEditGlyphLabel: (id: string, text: string) => void
  onEditSpeed: (id: string, ms: number) => void
  t: (key: string) => string
}) {
  const [over, setOver] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingField, setEditingField] = useState<EditField>('textContent')
  const [draftText, setDraftText] = useState('')
  const [speedPopoverId, setSpeedPopoverId] = useState<string | null>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const [, drop] = useDrop(() => ({
    accept: 'palette-item',
    drop: (dragItem: { type: string; label: string; glyphId?: string }) => {
      onDrop(dragItem)
    },
    collect: (m) => setOver(m.isOver()),
  }))

  const openEdit = (item: DropItem, field: EditField) => {
    if (field === 'textContent' && item.type !== 'text') return
    if (field === 'panelContent' && item.type !== 'panel') return
    if (field === 'confirmPrompt' && item.type !== 'confirm') return
    if (field === 'frameTitle' && item.type !== 'frame') return
    if (field === 'buttonLabel' && item.type !== 'button') return
    if ((field === 'glyphLabel') && item.type !== 'glyph' && item.type !== 'spinner') return
    setEditingId(item.id)
    setEditingField(field)
    const raw =
      field === 'textContent' ? (item.textContent ?? 'Sample text')
      : field === 'panelContent' ? (item.panelContent ?? 'Content')
      : field === 'confirmPrompt' ? (item.confirmPrompt ?? 'Continue?')
      : field === 'frameTitle' ? (item.frameTitle ?? '')
      : field === 'buttonLabel' ? (item.buttonLabel ?? 'Button')
      : (item.glyphLabel ?? item.label ?? (item.type === 'spinner' ? 'Working…' : ''))
    setDraftText(raw.slice(0, 240))
    setTimeout(() => inputRef.current?.focus(), 0)
  }
  const commitEdit = () => {
    if (!editingId) return
    if (editingField === 'textContent') onEditText(editingId, draftText.trim() || 'Sample text')
    else if (editingField === 'panelContent') onEditPanelContent(editingId, draftText.trim() || 'Content')
    else if (editingField === 'confirmPrompt') onEditConfirmPrompt(editingId, draftText.trim() || 'Continue?')
    else if (editingField === 'frameTitle') onEditFrameTitle(editingId, draftText.trim().slice(0, 12))
    else if (editingField === 'buttonLabel') onEditButtonLabel(editingId, draftText.trim() || 'Button')
    else if (editingField === 'glyphLabel') onEditGlyphLabel(editingId, draftText.trim().slice(0, 80))
    setEditingId(null)
  }
  const SPEED_OPTIONS = [80, 120, 200]

  useEffect(() => {
    if (!speedPopoverId) return
    const close = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node
      if (listRef.current && !listRef.current.contains(target)) setSpeedPopoverId(null)
    }
    document.addEventListener('mousedown', close)
    document.addEventListener('touchstart', close, { passive: true })
    return () => {
      document.removeEventListener('mousedown', close)
      document.removeEventListener('touchstart', close)
    }
  }, [speedPopoverId])

  return (
    <div ref={listRef}>
      <div
        ref={drop}
        className={`canvas-drop-zone canvas-drop-zone-list ${over ? 'drag-over' : ''}`}
      >
      {items.length === 0 && (
        <div className="canvas-empty-hint">
          <span className="canvas-empty-icon">⬇</span>
          <p>{t('canvas.dragHint')}</p>
          <p className="canvas-empty-sub">{t('canvas.previewSub')}</p>
        </div>
      )}
      {items.length > 0 && (
        <ul className="canvas-list">
          {items.map((item, index) => (
            <li key={item.id} className="canvas-list-row">
              <div className="canvas-list-order">
                <button type="button" className="canvas-list-arrow" onClick={() => onMoveUp(index)} disabled={index === 0} aria-label={t('canvas.moveUp')}>▲</button>
                <button type="button" className="canvas-list-arrow" onClick={() => onMoveDown(index)} disabled={index === items.length - 1} aria-label={t('canvas.moveDown')}>▼</button>
              </div>
              <span className="canvas-list-label">
                {item.type === 'text' && item.textContent ? `${item.textContent.slice(0, 20)}${item.textContent.length > 20 ? '…' : ''}` : item.type === 'panel' && item.panelContent ? `${item.panelContent.slice(0, 20)}${item.panelContent.length > 20 ? '…' : ''}` : item.type === 'confirm' && item.confirmPrompt ? `${item.confirmPrompt.slice(0, 20)}${item.confirmPrompt.length > 20 ? '…' : ''}` : item.type === 'frame' ? (item.frameTitle ? `${item.frameTitle.slice(0, 20)}${item.frameTitle.length > 20 ? '…' : ''}` : 'Frame') : item.type === 'button' ? (item.buttonLabel ?? 'Button') : (item.type === 'glyph' || item.type === 'spinner') && (item.glyphLabel != null && item.glyphLabel !== '') ? `${item.glyphLabel.slice(0, 20)}${item.glyphLabel.length > 20 ? '…' : ''}` : (item.label || item.type)}
              </span>
              {item.type === 'text' && (
                <button type="button" className="canvas-list-edit" onClick={() => openEdit(item, 'textContent')} title={t('canvas.editText')} aria-label={t('canvas.editTextAria')}>✎</button>
              )}
              {item.type === 'panel' && (
                <button type="button" className="canvas-list-edit" onClick={() => openEdit(item, 'panelContent')} title={t('canvas.editContent')} aria-label={t('canvas.editPanelAria')}>✎</button>
              )}
              {item.type === 'confirm' && (
                <button type="button" className="canvas-list-edit" onClick={() => openEdit(item, 'confirmPrompt')} title={t('canvas.editPrompt')} aria-label={t('canvas.editPromptAria')}>✎</button>
              )}
              {item.type === 'frame' && (
                <button type="button" className="canvas-list-edit" onClick={() => openEdit(item, 'frameTitle')} title={t('canvas.editText')} aria-label={t('canvas.editTextAria')}>✎</button>
              )}
              {item.type === 'button' && (
                <button type="button" className="canvas-list-edit" onClick={() => openEdit(item, 'buttonLabel')} title={t('canvas.editText')} aria-label={t('canvas.editTextAria')}>✎</button>
              )}
              {(item.type === 'glyph' || item.type === 'spinner') && (
                <button type="button" className="canvas-list-edit" onClick={() => openEdit(item, 'glyphLabel')} title={t('canvas.editText')} aria-label={t('canvas.editTextAria')}>✎</button>
              )}
              {(item.type === 'glyph' || item.type === 'spinner') && (
                <button type="button" className="canvas-list-tweak" onClick={() => setSpeedPopoverId((id) => (id === item.id ? null : item.id))} title="Hastighet (ms)" aria-label="Hastighet">⚙</button>
              )}
              <button type="button" className="canvas-list-remove" onClick={() => onRemove(item.id)} title={t('canvas.remove')}>×</button>
              {editingId === item.id && (
                <div className="canvas-list-text-popover">
                  <textarea
                    ref={inputRef}
                    value={draftText}
                    rows={3}
                    onChange={(e) => setDraftText(e.target.value.slice(0, 240))}
                    onBlur={commitEdit}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); commitEdit() }
                    }}
                    className="canvas-list-text-input canvas-list-textarea"
                    placeholder={editingField === 'panelContent' ? t('canvas.placeholderPanel') : editingField === 'confirmPrompt' ? t('canvas.placeholderPrompt') : editingField === 'frameTitle' ? 'Frame' : editingField === 'buttonLabel' ? 'Button' : editingField === 'glyphLabel' ? (items.find((x) => x.id === editingId)?.label ?? '') : t('canvas.placeholderText')}
                    aria-label={editingField === 'panelContent' ? t('canvas.editPanelAria') : editingField === 'confirmPrompt' ? t('canvas.editPromptAria') : t('canvas.editTextAria')}
                  />
                </div>
              )}
              {speedPopoverId === item.id && (item.type === 'glyph' || item.type === 'spinner') && (
                <div className="canvas-list-speed-popover" role="dialog" aria-label={t('canvas.speed')}>
                  <span className="canvas-list-speed-label">{t('canvas.speed')}</span>
                  <div className="canvas-list-speed-options">
                    {SPEED_OPTIONS.map((ms) => (
                      <button key={ms} type="button" className={`canvas-list-speed-option ${(item.speedMs ?? 200) === ms ? 'active' : ''}`} onClick={() => { onEditSpeed(item.id, ms); setSpeedPopoverId(null) }}>{ms}ms</button>
                    ))}
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
      </div>
    </div>
  )
}

// ── Main canvas ────────────────────────────────────────────────────────────
export { serializeTUI } from '../canvas/buildCode'

function CanvasInner() {
  const { t } = useLanguage()
  const [dropped, setDropped] = useState<DropItem[]>(() => [...INITIAL_DROPPED])
  const [tab, setTab] = useState<PaletteTab>('blocks')
  const [glyphSearch, setGlyphSearch] = useState('')
  const [glyphCategory, setGlyphCategory] = useState<GlyphCategory | 'all'>('all')
  const [copyFeedback, setCopyFeedback] = useState<'ok' | 'fail' | null>(null)
  useEffect(() => {
    if (copyFeedback == null) return
    const t = setTimeout(() => setCopyFeedback(null), 2000)
    return () => clearTimeout(t)
  }, [copyFeedback])

  const handleDrop = useCallback((dragItem: { type: string; label: string; glyphId?: string }) => {
    setDropped((prev) => [...prev, createDropItem(dragItem)])
  }, [])
  const handleRemove = useCallback((id: string) => {
    setDropped((prev) => prev.filter((i) => i.id !== id))
  }, [])
  const handleMoveUp = useCallback((index: number) => {
    if (index <= 0) return
    setDropped((prev) => {
      const next = [...prev]
      ;[next[index - 1], next[index]] = [next[index], next[index - 1]]
      return next
    })
  }, [])
  const handleMoveDown = useCallback((index: number) => {
    setDropped((prev) => {
      if (index >= prev.length - 1) return prev
      const next = [...prev]
      ;[next[index], next[index + 1]] = [next[index + 1], next[index]]
      return next
    })
  }, [])
  const handleEditText = useCallback((id: string, text: string) => {
    setDropped((prev) => prev.map((i) => (i.id === id && i.type === 'text' ? { ...i, textContent: text.slice(0, 240).replace(/\r/g, '') } : i)))
  }, [])
  const handleEditPanelContent = useCallback((id: string, text: string) => {
    setDropped((prev) => prev.map((i) => (i.id === id && i.type === 'panel' ? { ...i, panelContent: text.slice(0, 80).replace(/\r?\n/g, ' ') } : i)))
  }, [])
  const handleEditConfirmPrompt = useCallback((id: string, text: string) => {
    setDropped((prev) => prev.map((i) => (i.id === id && i.type === 'confirm' ? { ...i, confirmPrompt: text.slice(0, 80).replace(/\r?\n/g, ' ') } : i)))
  }, [])
  const handleEditFrameTitle = useCallback((id: string, text: string) => {
    setDropped((prev) => prev.map((i) => (i.id === id && i.type === 'frame' ? { ...i, frameTitle: text.slice(0, 12).replace(/\r?\n/g, ' ') } : i)))
  }, [])
  const handleEditButtonLabel = useCallback((id: string, text: string) => {
    setDropped((prev) => prev.map((i) => (i.id === id && i.type === 'button' ? { ...i, buttonLabel: text.slice(0, 80).replace(/\r?\n/g, ' ') } : i)))
  }, [])
  const handleEditGlyphLabel = useCallback((id: string, text: string) => {
    setDropped((prev) =>
      prev.map((i) =>
        i.id === id && (i.type === 'glyph' || i.type === 'spinner') ? { ...i, glyphLabel: text.slice(0, 80).replace(/\r?\n/g, ' ') } : i
      )
    )
  }, [])
  const handleEditSpeed = useCallback((id: string, ms: number) => {
    setDropped((prev) =>
      prev.map((i) =>
        i.id === id && (i.type === 'glyph' || i.type === 'spinner') ? { ...i, speedMs: ms } : i
      )
    )
  }, [])

  const filteredGlyphs = allGlyphAnimations.filter((g) => {
    const matchCategory = glyphCategory === 'all' || g.category === glyphCategory
    const matchSearch = !glyphSearch.trim() || g.name.toLowerCase().includes(glyphSearch.toLowerCase())
    return matchCategory && matchSearch
  })

  return (
    <div className="canvas-layout">
      <aside className="canvas-palette">
        {/* Tab bar */}
        <div className="palette-tabs">
          {([['blocks', t('canvas.blocks')], ['glyphs', t('canvas.glyphs')]] as [PaletteTab, string][]).map(([id, lbl]) => (
            <button
              key={id}
              type="button"
              className={`palette-tab ${tab === id ? 'active' : ''}`}
              onClick={() => setTab(id)}
            >
              {lbl}
            </button>
          ))}
        </div>

        {/* Blocks tab – TUI primitives + agentic UI (same idea as main page building blocks) */}
        {tab === 'blocks' && (
          <div className="palette-tab-content">
            {BLOCKS.map((p) => (
              <PaletteCard key={p.type} type={p.type} label={p.label} />
            ))}
          </div>
        )}

        {/* Glyphs tab – full library with category dropdown (mirrors main page categories) */}
        {tab === 'glyphs' && (
          <div className="palette-tab-content palette-tab-glyphs">
            <label className="palette-label" htmlFor="palette-glyph-category">
              {t('canvas.category')}
            </label>
            <select
              id="palette-glyph-category"
              className="palette-category-select"
              value={glyphCategory}
              onChange={(e) => setGlyphCategory(e.target.value as GlyphCategory | 'all')}
              aria-label={t('canvas.category')}
            >
              <option value="all">{t('canvas.categoryAll')}</option>
              {CATEGORY_ORDER.map((cat) => (
                <option key={cat} value={cat}>
                  {categoryLabels[cat]}
                </option>
              ))}
            </select>
            <input
              type="search"
              className="palette-glyph-search"
              placeholder={t('canvas.filterGlyphs')}
              value={glyphSearch}
              onChange={(e) => setGlyphSearch(e.target.value)}
              aria-label="Filter glyphs"
            />
            <div className="palette-glyph-list">
              {filteredGlyphs.map((g) => (
                <PaletteCard key={g.id} type="glyph" label={g.name} glyphId={g.id} />
              ))}
            </div>
          </div>
        )}
      </aside>

      <main className="canvas-stage">
        <div className="canvas-stage-toolbar">
          <button type="button" className="canvas-clear-btn" onClick={() => setDropped([])} disabled={dropped.length === 0} title={t('canvas.clearTitle')}>
            {t('canvas.clear')}
          </button>
        </div>
        <BuilderList items={dropped} onDrop={handleDrop} onRemove={handleRemove} onMoveUp={handleMoveUp} onMoveDown={handleMoveDown} onEditText={handleEditText} onEditPanelContent={handleEditPanelContent} onEditConfirmPrompt={handleEditConfirmPrompt} onEditFrameTitle={handleEditFrameTitle} onEditButtonLabel={handleEditButtonLabel} onEditGlyphLabel={handleEditGlyphLabel} onEditSpeed={handleEditSpeed} t={t} />
      </main>

      <div className="canvas-preview-wrap">
        <div className="canvas-preview-header">
          <span className="canvas-preview-title">{t('canvas.previewTitle')}</span>
          <button
            type="button"
            className="canvas-preview-copy"
            onClick={() => {
              navigator.clipboard.writeText(buildCopyCode(dropped))
                .then(() => setCopyFeedback('ok'))
                .catch(() => setCopyFeedback('fail'))
            }}
            title={t('canvas.copyBuildTitle')}
          >
            {copyFeedback === 'ok' ? t('canvas.copied') : copyFeedback === 'fail' ? t('canvas.copyFailed') : t('canvas.copyBuild')}
          </button>
        </div>
        <div className="canvas-preview-inner">
          <TUIPreviewContent items={dropped} />
        </div>
      </div>
    </div>
  )
}

export function CanvasView() {
  return (
    <DndProvider backend={HTML5Backend}>
      <CanvasInner />
    </DndProvider>
  )
}
