import { useEffect, useRef, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { CaretDown } from '@phosphor-icons/react/CaretDown'
// The slim index, not the full catalogue. Navbar only needs id, title and
// category to build the dropdown, and the full module is 36 KB of prose that
// would otherwise be downloaded by every visitor on every page. See
// src/data/serviceIndex.js and `npm run measure:services`.
import { serviceIndex as serviceSections, disciplines } from '../data/serviceIndex'
import Picture from './Picture'

const links = [
  { to: '/', label: 'Home' },
  { to: '/services', label: 'Services' },
  { to: '/about', label: 'About Us' },
  { to: '/gallery', label: 'Gallery' },
  { to: '/contact', label: 'Contact' },
]

const serviceGroups = disciplines.map((d) => ({
  ...d,
  services: serviceSections.filter((s) => s.category === d.id),
}))

const NAV_ID = 'primary-navigation'

function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const toggleRef = useRef(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

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
    <header className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="container nav-inner">
        <Link to="/" className="brand" aria-label="ALNANDA Contracting, home" onClick={() => setOpen(false)}>
            <Picture id="logo" alt="" loading="eager" fetchPriority="high" />
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
          {links.map((l) =>
            l.to === '/services' ? (
              <div className="nav-item" key={l.to}>
                <NavLink
                  to={l.to}
                  className={({ isActive }) => (isActive ? 'active' : '')}
                  onClick={() => setOpen(false)}
                  aria-haspopup="true"
                >
                  {l.label}
                  <CaretDown size={14} weight="bold" aria-hidden="true" className="nav-link-caret" />
                </NavLink>
                <div className="nav-dropdown" aria-label="Services">
                  {serviceGroups.map((g) => (
                    <div className="nav-dropdown-group" key={g.id}>
                      <p>{g.label}</p>
                      <ul>
                        {g.services.map((s) => (
                          <li key={s.id}>
                            <Link to={`/services/${s.id}`} onClick={() => setOpen(false)}>
                              {s.title}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === '/'}
                className={({ isActive }) => (isActive ? 'active' : '')}
                onClick={() => setOpen(false)}
              >
                {l.label}
              </NavLink>
            )
          )}
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