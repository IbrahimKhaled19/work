import Reveal from './Reveal'

export default function SectionHead({ eyebrow, title, text, children, className = '', delay = 0 }) {
  return (
    <Reveal className={`section-head ${className}`} delay={delay}>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h2>{title}</h2>
      {text && <p>{text}</p>}
      {children}
    </Reveal>
  )
}
