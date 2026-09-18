import { Link } from 'react-router-dom'

function PageHero({ title, subtitle, crumb }) {
  return (
    <section className="page-hero">
      <div className="container">
        <p className="page-crumb">
          <Link to="/">Home</Link> {crumb ? <span>/ {crumb}</span> : null}
        </p>
        <h1>{title}</h1>
        {subtitle ? <p className="page-subtitle">{subtitle}</p> : null}
      </div>
    </section>
  )
}

export default PageHero