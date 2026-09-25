import { useEffect, useRef, useState } from 'react'

function Reveal({ as: Tag = 'div', className = '', delay = 0, variant = 'up', children, ...rest }) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(() => typeof IntersectionObserver === 'undefined')

  useEffect(() => {
    const el = ref.current
    if (!el || visible) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          io.disconnect()
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px' }
    )
    io.observe(el)
    return () => io.disconnect()
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