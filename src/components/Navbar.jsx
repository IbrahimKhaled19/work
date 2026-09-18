import { useEffect, useRef, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'

const links = [
  { to: '/', label: 'Home' },
  { to: '/services', label: 'Services' },
  { to: '/about', label: 'About Us' },
  { to: '/gallery', label: 'Gallery' },
]

const NAV_ID = 'primary-navigation'

function Navbar() {
  const [open, setOpen] = useState(false)
  const toggleRef = useRef(null)

  const closeMenu = (returnFocus = false) => {
    setOpen(false)
    if (returnFocus) {
      toggleRef.current?.focus()
    }
  }

  useEffect(() => {
    if (!open) return
    const onKeyDown = (e) => {
      if (e.key === 'Escape') closeMenu(true)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open])

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  return (
    <>
    <header className="navbar">
      <div className="container nav-inner">
        <Link to="/" className="brand" onClick={() => setOpen(false)}>
          <span className="brand-seal" aria-hidden="true">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2.6 19.6 5.4v6.1c0 4.9-3.3 8.4-7.6 9.9-4.3-1.5-7.6-5-7.6-9.9V5.4L12 2.6Z" />
              <path d="M12 7.2c-1.3 1.7-2.6 2.8-2.6 4.7a2.6 2.6 0 0 0 5.2 0c0-1.9-1.3-3-2.6-4.7Z" fill="currentColor" stroke="none" />
            </svg>
          </span>
          <span className="brand-text">
            <strong>Universal Fire Fighting</strong>
            <small>Fire Safety &amp; Fire Fighting Systems</small>
            <span className="brand-dcd">
              <span className="brand-dcd-dot" aria-hidden="true"></span>DCD Approved
            </span>
          </span>
        </Link>

        <button
          type="button"
          ref={toggleRef}
          className={`nav-toggle ${open ? 'open' : ''}`}
          aria-label="Toggle navigation"
          aria-expanded={open}
          aria-controls={NAV_ID}
          onClick={() => (open ? closeMenu(false) : setOpen(true))}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <nav id={NAV_ID} aria-label="Primary" className={`nav-links ${open ? 'open' : ''}`}>
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/'}
              className={({ isActive }) => (isActive ? 'active' : '')}
              onClick={() => setOpen(false)}
            >
              {l.label}
            </NavLink>
          ))}
          <div className="nav-actions">
            <a
              href="tel:+97125512311"
              className="btn btn-outline-dark nav-call"
              aria-label="Call 24/7 emergency line at +971 2 5512 311"
              onClick={() => setOpen(false)}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.13.96.36 1.9.7 2.8a2 2 0 0 1-.45 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.25a2 2 0 0 1 2.1-.45c.9.34 1.84.57 2.8.7A2 2 0 0 1 22 16.9z" />
              </svg>
              Call 24/7
            </a>
            <Link to="/contact" className="btn btn-solid btn-quote" onClick={() => setOpen(false)}>
              Get a Free Quote
            </Link>
          </div>
        </nav>
      </div>
    </header>
    {open && (
      <div
        className="nav-backdrop"
        aria-hidden="true"
        onClick={() => closeMenu(true)}
      />
    )}
    </>
  )
}

export default Navbar