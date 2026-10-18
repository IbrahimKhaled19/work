import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Reveal from './Reveal'
import { serviceIndex, disciplines } from '../data/serviceIndex'

/**
 * The disciplines and their services, read from the taxonomy.
 *
 * This list used to be hand-copied here: four groups, thirteen titles and a
 * description each, about ninety lines beside the real data in services.js. It
 * could not drift without anything failing - verify:taxonomy checked that the
 * same ids appeared in the same groups, never that the words matched - so a
 * service renamed in the catalogue kept its old name on the homepage.
 *
 * Now it is derived, the same way Navbar derives its dropdown from the same
 * array. `text` is the sentence the service pages already use for their meta
 * descriptions, so the tab and the page it links to say the same thing.
 */
const serviceGroups = disciplines.map((d) => ({
  id: d.id,
  label: d.label,
  services: serviceIndex
    .filter((s) => s.category === d.id)
    .map((s) => ({ title: s.title, desc: s.text, anchor: s.id })),
}))

export default function ServicesTabs({ className = '', delay = 100 }) {
  const [active, setActive] = useState(serviceGroups[0].id)
  const group = serviceGroups.find((g) => g.id === active)
  const tabRefs = useRef({})

  /**
   * The ARIA tabs pattern. `role="tab"` promises arrow keys move between tabs
   * and that only the selected tab is in the tab order; without this the promise
   * is not kept and a keyboard user has to Tab through every tab.
   * https://www.w3.org/WAI/ARIA/apg/patterns/tabs/
   */
  const onKeyDown = (event, index) => {
    const last = serviceGroups.length - 1
    let next = null
    if (event.key === 'ArrowRight') next = index === last ? 0 : index + 1
    else if (event.key === 'ArrowLeft') next = index === 0 ? last : index - 1
    else if (event.key === 'Home') next = 0
    else if (event.key === 'End') next = last
    if (next === null) return

    event.preventDefault()
    const target = serviceGroups[next]
    setActive(target.id)
    tabRefs.current[target.id]?.focus()
  }

  return (
    <Reveal className={`services-tabs ${className}`} delay={delay}>
      <div className="tab-list" role="tablist" aria-label="Service disciplines">
        {serviceGroups.map((g, i) => (
          <button
            key={g.id}
            type="button"
            role="tab"
            id={`tab-${g.id}`}
            aria-selected={active === g.id}
            aria-controls={`panel-${g.id}`}
            tabIndex={active === g.id ? 0 : -1}
            ref={(el) => {
              tabRefs.current[g.id] = el
            }}
            className="tab-btn"
            onClick={() => setActive(g.id)}
            onKeyDown={(e) => onKeyDown(e, i)}
          >
            {g.label}
          </button>
        ))}
      </div>
      <div
        className="tab-panel"
        role="tabpanel"
        id={`panel-${group.id}`}
        aria-labelledby={`tab-${group.id}`}
        key={group.id}
      >
        {group.services.map((s) => (
          <Link to={`/services/${s.anchor}`} className="tab-service" key={s.anchor}>
            <h3>{s.title}</h3>
            <p>{s.desc}</p>
            <span className="card-link">View detail &rarr;</span>
          </Link>
        ))}
      </div>
    </Reveal>
  )
}