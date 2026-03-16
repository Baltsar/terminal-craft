import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  allGlyphAnimations,
  categoryLabels,
  CATEGORY_ORDER,
  type GlyphAnimation,
  type GlyphCategory,
} from '../data/glyphAnimations'
import { useLanguage } from '../context/LanguageContext'
import { GlyphCard } from './GlyphCard'
import { SpinnerGlyph } from './SpinnerGlyph'

export function GlyphAnimationsView() {
  const { t } = useLanguage()
  const [selectedCategories, setSelectedCategories] = useState<GlyphCategory[]>([])
  const [sort, setSort] = useState<'az' | 'za' | 'category'>('az')
  const [mockupGlyphs, setMockupGlyphs] = useState<{ glyph: GlyphAnimation; speed: number }[]>([])
  const [copyFeedback, setCopyFeedback] = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)
  const filterRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!filterOpen) return
    const handleClickOutside = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) setFilterOpen(false)
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [filterOpen])

  const addToMockup = useCallback((item: GlyphAnimation, speed = 200) => {
    setMockupGlyphs((prev) => [...prev, { glyph: item, speed }])
  }, [])

  const clearMockup = useCallback(() => {
    setMockupGlyphs([])
  }, [])

  const escapeForJs = (c: string) => {
    if (c === '\\') return "'\\\\'"
    if (c === "'") return "'\\''"
    if (c.length === 1 && c.charCodeAt(0) > 127) return "'\\u" + c.charCodeAt(0).toString(16).padStart(4, '0') + "'"
    return "'" + c + "'"
  }
  const copyMockupRow = useCallback(() => {
    if (mockupGlyphs.length === 0) return
    const snippet = mockupGlyphs
      .map((g) => `  ${g.glyph.id}: [${g.glyph.chars.map(escapeForJs).join(',')}],`)
      .join('\n')
    navigator.clipboard.writeText(snippet)
      .then(() => setCopyFeedback(true))
      .catch(() => {})
    setTimeout(() => setCopyFeedback(false), 1500)
  }, [mockupGlyphs])

  const toggleCategory = useCallback((cat: GlyphCategory) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    )
  }, [])

  const filtered = useMemo(() => {
    let list =
      selectedCategories.length === 0
        ? [...allGlyphAnimations]
        : allGlyphAnimations.filter((g) => selectedCategories.includes(g.category))
    if (sort === 'za') list = [...list].sort((a, b) => b.name.localeCompare(a.name))
    else if (sort === 'category') list = [...list].sort((a, b) => CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category))
    else list = [...list].sort((a, b) => a.name.localeCompare(b.name))
    return list
  }, [selectedCategories, sort])

  return (
    <div className="sg-wrap">
      <section className="sg-section">
        <h2 className="sg-section-title">Glyph animations</h2>
        <p className="sg-section-desc">
          Spinners & Throbbers, ASCII, Unicode, Hermes kawaii, Hermes CLI (thinking & tool feed), Progress, Agentic feeds. Copy data or usage.
        </p>

        <div className="sg-toolbar-row">
          <div className="sg-pills-wrap">
            <button
              type="button"
              className={`sg-pill ${selectedCategories.length === 0 ? 'active' : ''}`}
              onClick={() => setSelectedCategories([])}
            >
              All
            </button>
            {CATEGORY_ORDER.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`sg-pill ${selectedCategories.includes(cat) ? 'active' : ''}`}
                onClick={() => toggleCategory(cat)}
              >
                {categoryLabels[cat]}
              </button>
            ))}
          </div>
          <div className="sg-filter-trigger-wrap" ref={filterRef}>
            <button
              type="button"
              className={`sg-filter-btn ${filterOpen ? 'open' : ''}`}
              onClick={(e) => { e.stopPropagation(); setFilterOpen((o) => !o) }}
              aria-expanded={filterOpen}
              aria-haspopup="true"
              aria-label="Öppna filter"
            >
              Filter
            </button>
            {filterOpen && (
              <div className="sg-filter-dropdown">
                <div className="sg-filter-categories">
                  <span className="sg-label">Category</span>
                  <div className="sg-pills">
                    <button
                      type="button"
                      className={`sg-pill ${selectedCategories.length === 0 ? 'active' : ''}`}
                      onClick={() => setSelectedCategories([])}
                    >
                      All
                    </button>
                    {CATEGORY_ORDER.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        className={`sg-pill ${selectedCategories.includes(cat) ? 'active' : ''}`}
                        onClick={() => toggleCategory(cat)}
                      >
                        {categoryLabels[cat]}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="sg-label" htmlFor="glyph-sort">Sort</label>
                  <select
                    id="glyph-sort"
                    className="sg-select"
                    value={sort}
                    onChange={(e) => setSort(e.target.value as 'az' | 'za' | 'category')}
                    aria-label="Sort"
                  >
                    <option value="az">A–Z</option>
                    <option value="za">Z–A</option>
                    <option value="category">Category</option>
                  </select>
                </div>
                <p className="sg-result-count" aria-live="polite">
                  {filtered.length === allGlyphAnimations.length
                    ? `${filtered.length} animations`
                    : `Showing ${filtered.length} of ${allGlyphAnimations.length}`}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="sg-grid">
          {filtered.map((item) => (
            <GlyphCard
              key={item.id}
              item={item}
              onCopyData={() => {}}
              onCopyUsage={() => {}}
              onAddToMockup={addToMockup}
            />
          ))}
        </div>
      </section>

      <section id="terminal-mockup" className="sg-section" style={{ marginTop: 40 }}>
        <h2 className="sg-section-title">Terminal mockup</h2>
        <p className="sg-section-desc sg-section-desc-hover" title="Klicka på + på en glyph-kort för att lägga till den här. Live preview – 1:1 terminal feel.">
          Klicka på + på en glyph-kort för att lägga till den här. Live preview – 1:1 terminal feel.
        </p>
        <div className="sg-terminal">
          <div className="sg-terminal-titlebar">
            <span className="sg-terminal-dots">
              <span className="sg-terminal-dot" />
              <span className="sg-terminal-dot" />
              <span className="sg-terminal-dot" />
            </span>
            <span className="sg-terminal-title">zsh — termcraft</span>
            {mockupGlyphs.length > 0 && (
              <button
                type="button"
                className="sg-terminal-clear-all"
                onClick={clearMockup}
                aria-label="Rensa alla"
                title="Rensa alla glyphs från mockup"
              >
                Clear all
              </button>
            )}
          </div>
          <div className="sg-terminal-body">
            <div style={{ marginBottom: 4 }}>
              <span className="sg-terminal-prompt">user@host:~$</span> npm run build
            </div>
            {mockupGlyphs.length === 0 ? (
              <div style={{ marginBottom: 4 }}>
                <span style={{ marginRight: 8 }}><SpinnerGlyph chars={allGlyphAnimations.find((g) => g.id === 'dots')!.chars} speed={200} /></span> Building…
              </div>
            ) : (
              <div className="sg-terminal-mockup-single-row">
                {mockupGlyphs.map((g, i) => (
                  <span key={`${g.glyph.id}-${i}`} className="sg-mockup-slot" title={g.glyph.name}>
                    <SpinnerGlyph chars={g.glyph.chars} speed={g.speed} />
                  </span>
                ))}
              </div>
            )}
            <div>
              <span className="sg-terminal-prompt">user@host:~$</span>
              <span className="terminal-cursor" />
            </div>
          </div>
        </div>
        {mockupGlyphs.length > 0 && (
          <div className="sg-mockup-actions">
            <button
              type="button"
              className="sg-mockup-copy-row"
              onClick={copyMockupRow}
              aria-label={t('tui.copyRowTitle')}
              title={t('tui.copyRowTitle')}
            >
              {copyFeedback ? t('tui.copiedRow') : t('tui.copyRow')}
            </button>
          </div>
        )}
      </section>
    </div>
  )
}
