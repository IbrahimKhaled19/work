import { useEffect, useState } from 'react'
import { ArrowUp } from '@phosphor-icons/react/ArrowUp'

function BackToTop() {
  const [showTop, setShowTop] = useState(false)

  useEffect(() => {
    const sentinel = document.getElementById('top-sentinel')
    if (!sentinel) return
    // The sentinel sits 600px down the document with a plain observer:
    // visible while near the top (button hidden), scrolled past further
    // down (button shown). Short pages never push it out, so the button
    // stays hidden there too. No scroll listener needed.
    const tallEnough = () =>
      document.documentElement.scrollHeight > window.innerHeight + 600
    const observer = new IntersectionObserver(
      ([entry]) => setShowTop(tallEnough() && !entry.isIntersecting),
      { threshold: 0 }
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [])

  if (!showTop) return null

  return (
    <button
      type="button"
      className="back-to-top"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Back to top"
    >
      <svg className="back-to-top-ring" viewBox="0 0 56 56" aria-hidden="true">
        <circle className="back-to-top-track" cx="28" cy="28" r="24" pathLength="100" />
        <circle className="back-to-top-progress" cx="28" cy="28" r="24" pathLength="100" />
      </svg>
      <span className="back-to-top-icon">
        <ArrowUp size={18} weight="bold" aria-hidden="true" />
      </span>
    </button>
  )
}

export default BackToTop
