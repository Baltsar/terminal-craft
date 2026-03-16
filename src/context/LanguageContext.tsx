import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { type Lang, translations } from '../i18n/translations'

const STORAGE_KEY = 'glyphui-lang'

const LanguageContext = createContext<{
  lang: Lang
  setLang: (l: Lang) => void
  t: (key: string) => string
} | null>(null)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    if (typeof window === 'undefined') return 'en'
    const s = localStorage.getItem(STORAGE_KEY) as Lang | null
    return s === 'en' || s === 'sv' || s === 'es' ? s : 'en'
  })

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, lang) } catch {}
  }, [lang])

  const t = (key: string) => translations[lang][key] ?? translations.en[key] ?? key

  return (
    <LanguageContext.Provider value={{ lang, setLang: setLangState, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider')
  return ctx
}
