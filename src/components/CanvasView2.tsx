import { useCallback, useEffect, useRef, useState } from 'react'
import { TUIPreviewContent } from './TUIPreviewContent'
import { SpinnerGlyph } from './SpinnerGlyph'
import { allGlyphAnimations, categoryLabels, CATEGORY_ORDER, type GlyphCategory } from '../data/glyphAnimations'
import { useLanguage } from '../context/LanguageContext'
import type { DropItem } from '../canvas/types'
import { INITIAL_DROPPED, createDropItem } from '../canvas/types'
import { buildCopyCode } from '../canvas/buildCode'

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

type EditField = 'textContent' | 'panelContent' | 'confirmPrompt' | 'frameTitle' | 'buttonLabel' | 'glyphLabel'
type PaletteTab = 'blocks' | 'glyphs'

function formatItemLabel(item: DropItem): string {
  if (item.type === 'text' && item.textContent) return `${item.textContent.slice(0, 20)}${item.textContent.length > 20 ? '…' : ''}`
  if (item.type === 'panel' && item.panelContent) return `${item.panelContent.slice(0, 20)}${item.panelContent.length > 20 ? '…' : ''}`
  if (item.type === 'confirm' && item.confirmPrompt) return `${item.confirmPrompt.slice(0, 20)}${item.confirmPrompt.length > 20 ? '…' : ''}`
  if (item.type === 'frame') return item.frameTitle ? `${item.frameTitle.slice(0, 20)}${item.frameTitle.length > 20 ? '…' : ''}` : 'Frame'
  if (item.type === 'button') return item.buttonLabel ?? 'Button'
  if ((item.type === 'glyph' || item.type === 'spinner') && item.glyphLabel) return `${item.glyphLabel.slice(0, 20)}${item.glyphLabel.length > 20 ? '…' : ''}`
  return item.label || item.type
}

export function CanvasView2() {
  const { t } = useLanguage()
  const [dropped, setDropped] = useState<DropItem[]>(() => [...INITIAL_DROPPED])
  const [tab, setTab] = useState<PaletteTab>('blocks')
  const [glyphSearch, setGlyphSearch] = useState('')
  const [glyphCategory, setGlyphCategory] = useState<GlyphCategory | 'all'>('all')
  const [copyFeedback, setCopyFeedback] = useState<'ok' | 'fail' | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingField, setEditingField] = useState<EditField>('textContent')
  const [draftText, setDraftText] = useState('')
  const [speedPopoverId, setSpeedPopoverId] = useState<string | null>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (copyFeedback == null) return
    const id = setTimeout(() => setCopyFeedback(null), 2000)
    return () => clearTimeout(id)
  }, [copyFeedback])

  useEffect(() => {
    if (!speedPopoverId) return
    const close = (e: MouseEvent | TouchEvent) => {
      if (listRef.current && !listRef.current.contains(e.target as Node)) setSpeedPopoverId(null)
    }
    document.addEventListener('mousedown', close)
    document.addEventListener('touchstart', close, { passive: true })
    return () => {
      document.removeEventListener('mousedown', close)
      document.removeEventListener('touchstart', close)
    }
  }, [speedPopoverId])

  const handleAdd = useCallback((dragItem: { type: string; label: string; glyphId?: string }) => {
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
    if (index >= dropped.length - 1) return
    setDropped((prev) => {
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
      prev.map((i) => (i.id === id && (i.type === 'glyph' || i.type === 'spinner') ? { ...i, speedMs: ms } : i))
    )
  }, [])

  const openEdit = (item: DropItem, field: EditField) => {
    if (field === 'textContent' && item.type !== 'text') return
    if (field === 'panelContent' && item.type !== 'panel') return
    if (field === 'confirmPrompt' && item.type !== 'confirm') return
    if (field === 'frameTitle' && item.type !== 'frame') return
    if (field === 'buttonLabel' && item.type !== 'button') return
    if (field === 'glyphLabel' && item.type !== 'glyph' && item.type !== 'spinner') return
    setEditingId(item.id)
    setEditingField(field)
    const raw =
      field === 'textContent' ? (item.textContent ?? 'Sample text')
      : field === 'panelContent' ? (item.panelContent ?? 'Content')
      : field === 'confirmPrompt' ? (item.confirmPrompt ?? 'Continue?')
      : field === 'frameTitle' ? (item.frameTitle ?? '')
      : field === 'buttonLabel' ? (item.buttonLabel ?? 'Button')
      : (item.glyphLabel ?? item.label ?? (item.type === 'spinner' ? 'Working…' : ''))
    setDraftText(String(raw).slice(0, 240))
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  const commitEdit = () => {
    if (!editingId) return
    if (editingField === 'textContent') handleEditText(editingId, draftText.trim() || 'Sample text')
    else if (editingField === 'panelContent') handleEditPanelContent(editingId, draftText.trim() || 'Content')
    else if (editingField === 'confirmPrompt') handleEditConfirmPrompt(editingId, draftText.trim() || 'Continue?')
    else if (editingField === 'frameTitle') handleEditFrameTitle(editingId, draftText.trim().slice(0, 12))
    else if (editingField === 'buttonLabel') handleEditButtonLabel(editingId, draftText.trim() || 'Button')
    else if (editingField === 'glyphLabel') handleEditGlyphLabel(editingId, draftText.trim().slice(0, 80))
    setEditingId(null)
  }

  const SPEED_OPTIONS = [80, 120, 200]
  const filteredGlyphs = allGlyphAnimations.filter((g) => {
    const matchCategory = glyphCategory === 'all' || g.category === glyphCategory
    const matchSearch = !glyphSearch.trim() || g.name.toLowerCase().includes(glyphSearch.toLowerCase())
    return matchCategory && matchSearch
  })

  const paletteContent = (
    <>
      <div className="canvas2-palette-tabs">
        <button type="button" className={`canvas2-palette-tab ${tab === 'blocks' ? 'active' : ''}`} onClick={() => setTab('blocks')}>
          {t('canvas.blocks')}
        </button>
        <button type="button" className={`canvas2-palette-tab ${tab === 'glyphs' ? 'active' : ''}`} onClick={() => setTab('glyphs')}>
          {t('canvas.glyphs')}
        </button>
      </div>
      {tab === 'blocks' && (
        <div className="canvas2-palette-strip">
          {BLOCKS.map((p) => (
            <button
              key={p.type}
              type="button"
              className="canvas2-palette-chip"
              onClick={() => handleAdd({ type: p.type, label: p.label })}
            >
              <span className="canvas2-palette-chip-label">{p.label}</span>
              <span className="palette-preview">{p.preview}</span>
            </button>
          ))}
        </div>
      )}
      {tab === 'glyphs' && (
        <div className="canvas2-palette-glyphs">
          <select
            className="palette-category-select"
            value={glyphCategory}
            onChange={(e) => setGlyphCategory(e.target.value as GlyphCategory | 'all')}
            aria-label={t('canvas.category')}
          >
            <option value="all">{t('canvas.categoryAll')}</option>
            {CATEGORY_ORDER.map((cat) => (
              <option key={cat} value={cat}>{categoryLabels[cat]}</option>
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
          <div className="canvas2-palette-strip canvas2-palette-strip-glyphs">
            {filteredGlyphs.map((g) => (
              <button
                key={g.id}
                type="button"
                className="canvas2-palette-chip"
                onClick={() => handleAdd({ type: 'glyph', label: g.name, glyphId: g.id })}
              >
                <span className="canvas2-palette-chip-label">{g.name}</span>
                <SpinnerGlyph chars={g.chars} speed={200} className="palette-preview" />
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  )

  const listContent = (
    <div ref={listRef} className="canvas2-list-inner canvas2-build-zone">
      {dropped.length === 0 ? (
        <div className="canvas2-empty">
          <span className="canvas-empty-icon">⬇</span>
          <p className="canvas2-empty-hint-desktop">{t('canvas2.emptyHintDesktop')}</p>
          <p className="canvas2-empty-hint-mobile">{t('canvas2.emptyHint')}</p>
          <p className="canvas2-empty-sub">{t('canvas.previewSub')}</p>
        </div>
      ) : (
        <ul className="canvas-list">
          {dropped.map((item, index) => (
            <li key={item.id} className="canvas-list-row">
              <div className="canvas-list-order">
                <button type="button" className="canvas-list-arrow" onClick={() => handleMoveUp(index)} disabled={index === 0} aria-label={t('canvas.moveUp')}>▲</button>
                <button type="button" className="canvas-list-arrow" onClick={() => handleMoveDown(index)} disabled={index === dropped.length - 1} aria-label={t('canvas.moveDown')}>▼</button>
              </div>
              <span className="canvas-list-label">{formatItemLabel(item)}</span>
              {item.type === 'text' && <button type="button" className="canvas-list-edit" onClick={() => openEdit(item, 'textContent')} title={t('canvas.editText')} aria-label={t('canvas.editTextAria')}>✎</button>}
              {item.type === 'panel' && <button type="button" className="canvas-list-edit" onClick={() => openEdit(item, 'panelContent')} title={t('canvas.editContent')} aria-label={t('canvas.editPanelAria')}>✎</button>}
              {item.type === 'confirm' && <button type="button" className="canvas-list-edit" onClick={() => openEdit(item, 'confirmPrompt')} title={t('canvas.editPrompt')} aria-label={t('canvas.editPromptAria')}>✎</button>}
              {item.type === 'frame' && <button type="button" className="canvas-list-edit" onClick={() => openEdit(item, 'frameTitle')} title={t('canvas.editText')} aria-label={t('canvas.editTextAria')}>✎</button>}
              {item.type === 'button' && <button type="button" className="canvas-list-edit" onClick={() => openEdit(item, 'buttonLabel')} title={t('canvas.editText')} aria-label={t('canvas.editTextAria')}>✎</button>}
              {(item.type === 'glyph' || item.type === 'spinner') && (
                <button type="button" className="canvas-list-edit" onClick={() => openEdit(item, 'glyphLabel')} title={t('canvas.editText')} aria-label={t('canvas.editTextAria')}>✎</button>
              )}
              {(item.type === 'glyph' || item.type === 'spinner') && (
                <button type="button" className="canvas-list-tweak" onClick={() => setSpeedPopoverId((id) => (id === item.id ? null : item.id))} title={t('canvas.speed')} aria-label={t('canvas.speed')}>⚙</button>
              )}
              <button type="button" className="canvas-list-remove" onClick={() => handleRemove(item.id)} title={t('canvas.remove')}>×</button>
              {editingId === item.id && (
                <div className="canvas-list-text-popover">
                  <textarea
                    ref={inputRef}
                    value={draftText}
                    rows={3}
                    onChange={(e) => setDraftText(e.target.value.slice(0, 240))}
                    onBlur={commitEdit}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); commitEdit() } }}
                    className="canvas-list-text-input canvas-list-textarea"
                    placeholder={editingField === 'panelContent' ? t('canvas.placeholderPanel') : editingField === 'confirmPrompt' ? t('canvas.placeholderPrompt') : editingField === 'frameTitle' ? 'Frame' : editingField === 'buttonLabel' ? 'Button' : editingField === 'glyphLabel' ? (dropped.find((x) => x.id === editingId)?.label ?? '') : t('canvas.placeholderText')}
                    aria-label={t('canvas.editTextAria')}
                  />
                </div>
              )}
              {speedPopoverId === item.id && (item.type === 'glyph' || item.type === 'spinner') && (
                <div className="canvas-list-speed-popover" role="dialog" aria-label={t('canvas.speed')}>
                  <span className="canvas-list-speed-label">{t('canvas.speed')}</span>
                  <div className="canvas-list-speed-options">
                    {SPEED_OPTIONS.map((ms) => (
                      <button key={ms} type="button" className={`canvas-list-speed-option ${(item.speedMs ?? 200) === ms ? 'active' : ''}`} onClick={() => { handleEditSpeed(item.id, ms); setSpeedPopoverId(null) }}>{ms}ms</button>
                    ))}
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )

  const previewContent = (
    <div className="canvas2-preview-wrap">
      <div className="canvas2-preview-header">
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
      <div className="canvas2-preview-inner">
        <TUIPreviewContent items={dropped} useCanvas2EmptyHint />
      </div>
    </div>
  )

  const toolbar = (
    <div className="canvas-stage-toolbar">
      <button type="button" className="canvas-clear-btn" onClick={() => setDropped([])} disabled={dropped.length === 0} title={t('canvas.clearTitle')}>
        {t('canvas.clear')}
      </button>
    </div>
  )

  return (
    <div className="canvas2-layout">
      <aside className="canvas2-palette">{paletteContent}</aside>
      <main className="canvas2-stage">
        {toolbar}
        {listContent}
      </main>
      <div className="canvas2-preview">{previewContent}</div>
      <div className="canvas2-palette-mobile" aria-hidden>
        {paletteContent}
      </div>
    </div>
  )
}
