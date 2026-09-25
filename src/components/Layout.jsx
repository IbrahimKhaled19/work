import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
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
    </>
  )
}

export default Layout