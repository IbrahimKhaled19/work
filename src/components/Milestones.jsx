import Reveal from './Reveal'

function Milestones({
  items,
  className = '',
  delay = 100,
  header,
  headerDelay = 0,
  headerClassName = '',
}) {
  return (
    <div className={className}>
      {header && (
        <Reveal className={`section-head ${headerClassName}`} delay={headerDelay}>
          {header.eyebrow && <p className="eyebrow">{header.eyebrow}</p>}
          <h2>{header.title}</h2>
          {header.text && <p>{header.text}</p>}
        </Reveal>
      )}
      <Reveal className="milestones" delay={delay}>
        {items.map((item) => (
          <div className="milestone" key={item.step || item.year}>
            {item.step && <strong>{item.step}</strong>}
            {item.year && <strong>{item.year}</strong>}
            <h3>{item.title}</h3>
            <p>{item.text || item.desc}</p>
          </div>
        ))}
      </Reveal>
    </div>
  )
}

export default Milestones