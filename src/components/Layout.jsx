import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'
import BackToTop from './BackToTop'
import Seo from './Seo'

function Layout() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0)
      return
    }

    const id = hash.slice(1)
    const scrollToTarget = () => {
      const el = document.getElementById(id)
      if (!el) return false
      el.scrollIntoView({ block: 'start' })
      return true
    }

    if (scrollToTarget()) return

    // Every route except the homepage is React.lazy, so on a shared deep link
    // like /services/fire-pump-systems#why-alnada the anchor usually does not
    // exist yet when this effect runs. It used to get exactly one animation
    // frame of grace and then dumped the visitor at the top of the page. Keep
    // looking for about a second instead - a slow chunk on a phone is well
    // inside that - and only fall back if the element never turns up.
    let frames = 0
    let raf = requestAnimationFrame(function retry() {
      frames += 1
      if (scrollToTarget()) return
      if (frames < 60) raf = requestAnimationFrame(retry)
      else window.scrollTo(0, 0)
    })

    return () => cancelAnimationFrame(raf)
  }, [pathname, hash])

  return (
    <>
      <Seo />
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