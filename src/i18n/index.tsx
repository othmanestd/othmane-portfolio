import {
  createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode,
} from 'react'
import { dict, type TranslationKey } from './dict'
import type { Locale } from '@/lib/types'

export const LOCALES: { code: Locale; label: string; native: string }[] = [
  { code: 'en', label: 'EN', native: 'English' },
  { code: 'fr', label: 'FR', native: 'Français' },
  { code: 'ar', label: 'AR', native: 'العربية' },
]

interface I18nValue {
  locale: Locale
  setLocale: (locale: Locale) => void
  tr: (key: TranslationKey) => string
  dir: 'ltr' | 'rtl'
  isRtl: boolean
}

const I18nContext = createContext<I18nValue | null>(null)

function detectLocale(): Locale {
  try {
    const stored = localStorage.getItem('os.lang')
    if (stored === 'fr' || stored === 'en' || stored === 'ar') return stored
  } catch { /* private mode */ }
  const nav = navigator.language?.slice(0, 2).toLowerCase()
  if (nav === 'fr') return 'fr'
  if (nav === 'ar') return 'ar'
  return 'en'
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(detectLocale)

  useEffect(() => {
    const dir = locale === 'ar' ? 'rtl' : 'ltr'
    document.documentElement.lang = locale
    document.documentElement.dir = dir
    try { localStorage.setItem('os.lang', locale) } catch { /* private mode */ }
  }, [locale])

  const setLocale = useCallback((next: Locale) => setLocaleState(next), [])

  const tr = useCallback(
    (key: TranslationKey) => dict[locale][key] ?? dict.en[key] ?? key,
    [locale],
  )

  const value = useMemo<I18nValue>(
    () => ({ locale, setLocale, tr, dir: locale === 'ar' ? 'rtl' : 'ltr', isRtl: locale === 'ar' }),
    [locale, setLocale, tr],
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used inside I18nProvider')
  return ctx
}
