import { useEffect } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'
import BackToTop from './BackToTop'

function Layout() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (hash) {
      const id = hash.slice(1)
      const scrollToTarget = () => {
        const el = document.getElementById(id)
        if (el) {
          el.scrollIntoView({ block: 'start' })
          return true
        }
        return false
      }
      if (scrollToTarget()) return
      // Route transition race: retry once after paint,
      // then fall back to top so a missing anchor never strands the visitor mid-page.
      const raf = requestAnimationFrame(() => {
        if (!scrollToTarget()) {
          window.scrollTo(0, 0)
        }
      })
      return () => cancelAnimationFrame(raf)
    }
    window.scrollTo(0, 0)
  }, [pathname, hash])

  return (
    <>
      <div id="top-sentinel" className="top-sentinel" aria-hidden="true" />
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
      <BackToTop />
      <div className="mobile-action-bar" role="navigation" aria-label="Quick contact">
        <a href="tel:+97125512311" className="mobile-action-call">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.13.96.36 1.9.7 2.8a2 2 0 0 1-.45 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.25a2 2 0 0 1 2.1-.45c.9.34 1.84.57 2.8.7A2 2 0 0 1 22 16.9z" />
          </svg>
          Call Now
        </a>
        <Link to="/contact" className="mobile-action-quote">
          Get a Free Quote
        </Link>
      </div>
    </>
  )
}

export default Layout