import Reveal from './Reveal'

function WhyList({
  items,
  className = '',
  delay = 100,
  as = 'ul',
}) {
  return (
    <Reveal as={as} className={`why-list ${className}`} delay={delay}>
      {items.map((item) => (
        <li className="why-row" key={item.title}>
          <span className="why-row-icon" aria-hidden="true">
            <item.Icon size={28} />
          </span>
          <div>
            <h3>{item.title}</h3>
            <p>{item.desc}</p>
          </div>
        </li>
      ))}
    </Reveal>
  )
}

export default WhyList