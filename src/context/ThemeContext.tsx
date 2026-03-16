import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

export type Theme =
  | 'dark'
  | 'terminal'
  | 'light'
  | 'midnight'
  | 'paper'
  | 'mono'
  | 'amber'
  | 'solarizedLight'

export const THEME_ORDER: Theme[] = [
  'dark',
  'terminal',
  'light',
  'midnight',
  'paper',
  'mono',
  'amber',
  'solarizedLight',
]

const THEME_SET = new Set<Theme>(THEME_ORDER)

const STORAGE_KEY = 'glyphui-theme'

const ThemeContext = createContext<{
  theme: Theme
  setTheme: (t: Theme) => void
} | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'dark'
    const s = localStorage.getItem(STORAGE_KEY)
    return s && THEME_SET.has(s as Theme) ? (s as Theme) : 'dark'
  })

  useEffect(() => {
    document.body.setAttribute('data-theme', theme)
    try { localStorage.setItem(STORAGE_KEY, theme) } catch {}
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, setTheme: setThemeState }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
