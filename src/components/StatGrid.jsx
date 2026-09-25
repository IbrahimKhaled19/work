import { Link } from 'react-router-dom'
import CountUp from './CountUp'
import Reveal from './Reveal'

function StatGrid({
  stats,
  className = '',
  delay = 0,
}) {
  return (
    <section className={`stats ${className}`}>
      <div className="container">
        <Reveal className="stats-grid" delay={delay}>
          {stats.map((s) => {
            const figure =
              typeof s.target === 'number' ? (
                <CountUp target={s.target} suffix={s.suffix} duration={s.duration} />
              ) : (
                s.value
              )
            return s.to ? (
              <Link
                to={s.to}
                className="stat stat-link"
                key={s.label}
                aria-label={s.aria}
              >
                <strong>{figure}</strong>
                <span className="stat-label">{s.label}</span>
              </Link>
            ) : (
              <div className="stat" key={s.label}>
                <strong>{figure}</strong>
                <span className="stat-label">{s.label}</span>
              </div>
            )
          })}
        </Reveal>
      </div>
    </section>
  )
}

export default StatGrid