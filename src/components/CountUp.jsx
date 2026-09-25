import { useEffect, useRef, useState } from 'react'

function easeOutExpo(t) {
  return t >= 1 ? 1 : 1 - Math.pow(2, -10 * t)
}

function showFinalValue() {
  if (typeof window === 'undefined') return true
  if (
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ) {
    return true
  }
  return typeof IntersectionObserver === 'undefined'
}

function CountUp({ target, prefix = '', suffix = '', duration = 1200 }) {
  const [display, setDisplay] = useState(() => (showFinalValue() ? target : 0))
  const [started, setStarted] = useState(() => showFinalValue())
  const liveRef = useRef(null)
  const rafRef = useRef(0)
  const finalText = `${prefix}${target}${suffix}`

  useEffect(() => {
    const el = liveRef.current
    if (!el || started) return

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true)
          io.disconnect()
        }
      },
      { threshold: 0.4, rootMargin: '0px 0px -10% 0px' }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [started, target])

  useEffect(() => {
    if (!started || showFinalValue()) return

    let start = null
    const tick = (now) => {
      if (start === null) start = now
      const elapsed = now - start
      const t = Math.min(elapsed / duration, 1)
      setDisplay(Math.round(target * easeOutExpo(t)))
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick)
      }
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [started, target, duration])

  return (
    <>
      <span ref={liveRef} aria-hidden="true">
        {prefix}
        {display}
        {suffix}
      </span>
      <span className="sr-only">{finalText}</span>
    </>
  )
}

export default CountUp
