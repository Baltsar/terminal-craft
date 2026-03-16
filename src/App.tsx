import { useState, useEffect, useRef } from 'react'
import { useTheme, THEME_ORDER } from './context/ThemeContext'
import { useLanguage } from './context/LanguageContext'
import { GlyphAnimationsView } from './components/GlyphAnimationsView'
import { CanvasView2 } from './components/CanvasView2'
import { AppFooter } from './components/AppFooter'

type ViewMode = 'glyphs' | 'canvas'
type Lang = 'en' | 'sv' | 'es'

const LANG_FLAGS: Record<Lang, string> = { en: '🇺🇸', sv: '🇸🇪', es: '🇪🇸' }

export default function App() {
  const { theme, setTheme } = useTheme()
  const { lang, setLang, t } = useLanguage()
  const [mode, setMode] = useState<ViewMode>('glyphs')
  const [langOpen, setLangOpen] = useState(false)
  const [themeOpen, setThemeOpen] = useState(false)
  const langRef = useRef<HTMLDivElement>(null)
  const themeRef = useRef<HTMLDivElement>(null)


  useEffect(() => {
    if (!langOpen) return
    const close = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false)
    }
    document.addEventListener('click', close)
    return () => document.removeEventListener('click', close)
  }, [langOpen])

  useEffect(() => {
    if (!themeOpen) return
    const close = (e: MouseEvent) => {
      if (themeRef.current && !themeRef.current.contains(e.target as Node)) setThemeOpen(false)
    }
    document.addEventListener('click', close)
    return () => document.removeEventListener('click', close)
  }, [themeOpen])

  return (
    <div className="app-wrap">
      <header className="app-header">
        <h1 className="app-title">TERMCRAFT</h1>
        <nav className="app-nav" aria-label="Main">
          <button
            type="button"
            className={mode === 'glyphs' ? 'active' : ''}
            onClick={() => setMode('glyphs')}
          >
            {t('app.glyphAnimations')}
          </button>
          <button
            type="button"
            className={`app-nav-canvas ${mode === 'canvas' ? 'active' : ''}`}
            onClick={() => setMode('canvas')}
            title={t('app.canvasTitle')}
          >
            {t('app.tuiCanvas')}
          </button>
        </nav>
        <div className="app-header-right">
          <div className="theme-switcher" ref={themeRef}>
            <button
              type="button"
              className="theme-trigger"
              onClick={() => setThemeOpen((o) => !o)}
              aria-expanded={themeOpen}
              aria-haspopup="listbox"
              aria-label={t('app.themeLabel')}
              title={t('app.themeLabel')}
            >
              {t(`app.theme.${theme}`)}
            </button>
            {themeOpen && (
              <div className="theme-menu" role="listbox" aria-label={t('app.themeLabel')}>
                {THEME_ORDER.map((th) => (
                  <button
                    key={th}
                    type="button"
                    role="option"
                    aria-selected={theme === th}
                    className={`theme-option ${theme === th ? 'active' : ''}`}
                    onClick={() => { setTheme(th); setThemeOpen(false) }}
                  >
                    {t(`app.theme.${th}`)}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="app-lang-dropdown" ref={langRef}>
            <button
              type="button"
              className="app-lang-trigger"
              onClick={() => setLangOpen((o) => !o)}
              aria-expanded={langOpen}
              aria-haspopup="true"
              aria-label="Language"
              title="Language"
            >
              {LANG_FLAGS[lang]}
            </button>
            {langOpen && (
              <div className="app-lang-menu" role="menu">
                {(['en', 'sv', 'es'] as const).map((l) => (
                  <button
                    key={l}
                    type="button"
                    role="menuitem"
                    className={`app-lang-option ${lang === l ? 'active' : ''}`}
                    onClick={() => { setLang(l); setLangOpen(false) }}
                  >
                    {LANG_FLAGS[l]}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>
      <main className="app-main">
        {mode === 'glyphs' && <GlyphAnimationsView />}
        {mode === 'canvas' && <CanvasView2 />}
      </main>
      <AppFooter />
    </div>
  )
}
