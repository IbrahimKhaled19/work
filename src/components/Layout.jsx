import { useEffect } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { WhatsappLogo } from '@phosphor-icons/react/WhatsappLogo'
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
        <a
          href="https://wa.me/201095438894"
          target="_blank"
          rel="noopener noreferrer"
          className="mobile-action-call"
          aria-label="Chat on WhatsApp: +20 109 543 8894"
        >
          <WhatsappLogo size={16} aria-hidden="true" />
          WhatsApp
        </a>
        <Link to="/contact" className="mobile-action-quote">
          Get a Free Quote
        </Link>
      </div>
    </>
  )
}

export default Layout