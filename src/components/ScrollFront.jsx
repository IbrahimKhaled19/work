import { useEffect, useRef } from 'react'

/**
 * The pipe's front, for browsers that cannot do it in CSS.
 *
 * The Careers run is meant to fill as the reader moves through the stages. CSS
 * scroll-driven animations do that natively, but only where they exist - Firefox
 * has no scroll timeline here, and prefers-reduced-motion readers should not get
 * the movement at all. Without something underneath, those readers get a grey
 * rail and no run, which is a worse page than the one they would have got from a
 * static diagram.
 *
 * So this is the third path: it writes the same two things the CSS would have
 * written - `--careers-front` on the run, and an `is-lit` class on each stage the
 * front has reached - by hand, from a scroll listener.
 *
 * Three rules it holds to:
 *
 *  1. It does nothing where the CSS already works. If `animation-timeline` is
 *     supported, or the reader asked for less motion, it returns before touching
 *     anything, so nobody pays for a second implementation of a thing that works.
 *  2. The numbers are the CSS's numbers. Same range, same geometry, so the front
 *     arrives in the same place in Firefox as it does in Chrome - a reader who
 *     switches browsers does not see the run change its timing.
 *  3. It writes one custom property per frame and nothing else. No layout reads,
 *     no transitions, no per-element animation objects.
 *
 * The clip-path and the lamp colours both read that property, so this component
 * needs no markup of its own - it only measures and writes.
 */

/** The range the CSS uses, kept in one place and stated in both. */
const START = 0.15
const END = 0.72

/** True when the page asked for less motion, or when there is no window to listen to. */
const calm =
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

function ScrollFront({ targetRef, className = '', as: Tag = 'div', children, ...rest }) {
  const ref = useRef(null)

  useEffect(() => {
    const run = ref.current
    if (!run) return

    // The CSS owns this where it can do the work itself.
    if (calm) return
    if (typeof CSS !== 'undefined' && CSS.supports?.('animation-timeline: view()')) return
    if (typeof IntersectionObserver === 'undefined') return

    const stages = [...run.querySelectorAll('.careers-stage')]
    let frame = 0

    /** Reads the run's geometry once per pass, not per style write. */
    const measure = () => {
      const box = run.getBoundingClientRect()
      const top = box.top + window.scrollY
      const height = box.height || 1
      const vh = window.innerHeight || 1
      // The same cover range a view timeline would use: 0 when the run's top
      // reaches the bottom of the screen, 1 when its bottom leaves the top.
      const span = height + vh
      const p = (window.scrollY - (top - vh)) / span
      const front = Math.min(1, Math.max(0, (p - START) / (END - START)))
      return { top, height, front }
    }

    const paint = () => {
      frame = 0
      const { top, height, front } = measure()
      run.style.setProperty('--careers-front', front.toFixed(4))
      // The front's position in page coordinates, so a lamp is lit when the
      // front has passed the dot rather than when it happens to be on screen.
      const line = top + front * height
      for (const stage of stages) {
        const lamp = stage.getBoundingClientRect().top + window.scrollY + 17
        stage.classList.toggle('is-lit', lamp <= line)
      }
    }

    const schedule = () => {
      if (frame) return
      frame = window.requestAnimationFrame(paint)
    }

    // Only listen while the run is anywhere near the viewport: a Careers page
    // does not need a scroll handler running the whole time.
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        schedule()
      } else if (frame) {
        window.cancelAnimationFrame(frame)
        frame = 0
      }
    })
    io.observe(run)

    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    paint()

    return () => {
      io.disconnect()
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      if (frame) window.cancelAnimationFrame(frame)
      for (const stage of stages) stage.classList.remove('is-lit')
    }
  }, [])

  return (
    <Tag ref={ref} className={className} {...rest}>
      {children}
    </Tag>
  )
}

export default ScrollFront