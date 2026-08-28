import { Suspense, lazy, useEffect } from 'react'
import { Outlet, Route, Routes, useLocation } from 'react-router-dom'
import { I18nProvider, useI18n } from '@/i18n'
import { ThemeProvider } from '@/hooks/useTheme'
import { ContentProvider } from '@/hooks/useContent'
import { Nav } from '@/components/Nav'
import { Footer } from '@/components/Footer'
import { Chatbot } from '@/components/Chatbot'
import { Cursor } from '@/components/Cursor'
import { PageLoader } from '@/components/ui'
import { trackPageView } from '@/lib/analytics'

import Home from '@/pages/Home'
import Work from '@/pages/Work'
import CaseStudy from '@/pages/CaseStudy'
import About from '@/pages/About'
import Contact from '@/pages/Contact'
import Card from '@/pages/Card'
import NotFound from '@/pages/NotFound'

// The admin bundle is only ever needed by one person — keep it out of the
// critical path for visitors.
const AdminApp = lazy(() => import('@/admin/AdminApp'))

/** Scroll to top and emit a page view on every navigation. */
function RouteEffects() {
  const location = useLocation()
  const { locale } = useI18n()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }, [location.pathname])

  useEffect(() => {
    trackPageView(location.pathname, locale)
  }, [location.pathname, locale])

  return null
}

function PublicLayout() {
  return (
    <>
      <div className="grain" aria-hidden />
      <div className="grid-lines" aria-hidden />
      <Cursor />
      <Nav />
      <main id="main" className="relative z-10">
        <Outlet />
      </main>
      <Footer />
      <Chatbot />
    </>
  )
}

/** The NFC card is a destination in its own right — no nav, no footer. */
function BareLayout() {
  return (
    <>
      <div className="grain" aria-hidden />
      <main id="main" className="relative z-10">
        <Outlet />
      </main>
    </>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <I18nProvider>
        <ContentProvider>
          <RouteEffects />
          <Routes>
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/work" element={<Work />} />
              <Route path="/work/:slug" element={<CaseStudy />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="*" element={<NotFound />} />
            </Route>

            <Route element={<BareLayout />}>
              <Route path="/card" element={<Card />} />
            </Route>

            <Route
              path="/admin/*"
              element={
                <Suspense fallback={<PageLoader label="Admin" />}>
                  <AdminApp />
                </Suspense>
              }
            />
          </Routes>
        </ContentProvider>
      </I18nProvider>
    </ThemeProvider>
  )
}
