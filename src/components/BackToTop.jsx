import { useEffect, useState } from 'react'
import { ArrowUp } from '@phosphor-icons/react/ArrowUp'

function BackToTop() {
  const [showTop, setShowTop] = useState(false)

  useEffect(() => {
    const sentinel = document.getElementById('top-sentinel')
    if (!sentinel) return
    // The sentinel sits at the very top of the page. Once the visitor
    // scrolls more than ~600px, it leaves the (top-shrunk) observation
    // root and the button appears. No scroll listener needed.
    const observer = new IntersectionObserver(
      ([entry]) => setShowTop(!entry.isIntersecting),
      { rootMargin: '-600px 0px 0px 0px', threshold: 0 }
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
      <ArrowUp size={16} weight="bold" aria-hidden="true" />
      Top
    </button>
  )
}

export default BackToTop