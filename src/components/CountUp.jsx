import { useEffect, useLayoutEffect, useRef, useState } from 'react'

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

/**
 * A number that counts up when it comes into view.
 *
 * WHY THE INITIAL STATE IS THE FINAL VALUE
 * ----------------------------------------
 * This component renders on the server too (scripts/prerender.mjs), and the two
 * sides disagreed. `showFinalValue()` is true on the server - there is no window
 * there - so the prerendered HTML shipped 10+ / 100+ / 13, while the browser's
 * first render started from 0. The client therefore never matched the markup it
 * was hydrating: React threw the prerendered subtree away and re-rendered it,
 * and every visitor saw the stat row flash zeros before it counted up.
 *
 * So both sides render `target` first. The count-up, when it is wanted, is a
 * *layout* effect: it runs after hydration and before the browser paints, so
 * the number goes to zero in the same frame it was drawn and nobody ever sees
 * the final value drop backwards. A visitor with no JavaScript, or with
 * prefers-reduced-motion, keeps the real number and never sees the animation.
 */
function CountUp({ target, prefix = '', suffix = '', duration = 1200 }) {
  const calm = showFinalValue()
  const [display, setDisplay] = useState(target)
  const [started, setStarted] = useState(false)
  const liveRef = useRef(null)
  const rafRef = useRef(0)
  const finalText = `${prefix}${target}${suffix}`

  useLayoutEffect(() => {
    // Zero it before paint, so the count-up starts from zero without a visible
    // jump from the prerendered value. The synchronous setState is deliberate:
    // initialising the zero instead would reintroduce the hydration flash the
    // note above explains, so the rule is told to stand down here.
    // eslint-disable-next-line react/set-state-in-effect
    if (!calm) setDisplay(0)
  }, [calm, target])

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
  }, [started])

  useEffect(() => {
    if (!started || calm) return

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
  }, [started, calm, target, duration])

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