import { useEffect, useRef, useState } from 'react'

/**
 * One observer for every Reveal on the page.
 *
 * Each Reveal used to build its own IntersectionObserver. That is ~20 observers
 * on the homepage, each holding a closure and a threshold check, all doing the
 * same job with the same options - so the options live here once and the
 * callbacks are looked up by element.
 *
 * The observer is created on first use and never torn down: it holds no
 * component state, the callbacks are deleted as they fire, and a page that
 * unmounts its last Reveal leaves an idle observer behind rather than a leak.
 */
let observer = null
const callbacks = new WeakMap()

function sharedObserver() {
  if (!observer) {
    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          const cb = callbacks.get(entry.target)
          if (cb) {
            callbacks.delete(entry.target)
            observer.unobserve(entry.target)
            cb()
          }
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px' }
    )
  }
  return observer
}

function Reveal({ as: Tag = 'div', className = '', delay = 0, variant = 'up', children, ...rest }) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(() => typeof IntersectionObserver === 'undefined')

  useEffect(() => {
    const el = ref.current
    if (!el || visible) return
    const io = sharedObserver()
    callbacks.set(el, () => setVisible(true))
    io.observe(el)
    return () => {
      callbacks.delete(el)
      io.unobserve(el)
    }
  }, [visible])

  return (
    <Tag
      ref={ref}
      className={`reveal${variant !== 'up' ? ` reveal-${variant}` : ''}${visible ? ' is-visible' : ''}${className ? ` ${className}` : ''}`}
      style={{ '--reveal-delay': `${delay}ms` }}
      {...rest}
    >
      {children}
    </Tag>
  )
}

export default Reveal