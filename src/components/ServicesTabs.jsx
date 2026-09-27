import { useState } from 'react'
import { Link } from 'react-router-dom'
import Reveal from './Reveal'

const serviceGroups = [
  {
    id: 'engineering',
    label: 'Engineering',
    services: [
      {
        title: 'Design & Engineering',
        desc: 'Hydraulic calculations, pump sizing, shop drawings, and code review before a single pipe goes in.',
        anchor: 'design-engineering',
      },
      {
        title: 'Passive Fire Protection',
        desc: 'Fire-rated doors, dampers, firestopping, and coatings that contain fire and protect escape routes.',
        anchor: 'passive-fire-protection',
      },
    ],
  },
  {
    id: 'suppression',
    label: 'Suppression',
    services: [
      {
        title: 'Fire Pump Systems',
        desc: 'Electric, diesel, and jockey pumps sized, installed, and acceptance-tested to NFPA 20.',
        anchor: 'fire-pump-systems',
      },
      {
        title: 'Sprinkler Systems',
        desc: 'Wet, dry, pre-action, deluge, and ESFR systems matched to your hazard classification.',
        anchor: 'sprinkler-systems',
      },
      {
        title: 'Standpipe & Hose Systems',
        desc: 'Class I-III standpipes, hose cabinets, and Fire Department Connections sized to code.',
        anchor: 'standpipe-hose-systems',
      },
      {
        title: 'Portable Fire Extinguishers',
        desc: 'Correct type, correct placement, inspected and recharged on schedule.',
        anchor: 'portable-extinguishers',
      },
      {
        title: 'Special Hazard & Suppression',
        desc: 'FM-200, CO2, kitchen hood, and foam systems for server rooms, kitchens, and flammable storage.',
        anchor: 'special-hazard-suppression',
      },
    ],
  },
  {
    id: 'detection',
    label: 'Detection',
    services: [
      {
        title: 'Fire Alarm & Detection',
        desc: 'Addressable detection, notification, and BMS integration that alerts fast enough to matter.',
        anchor: 'fire-alarm-detection',
      },
    ],
  },
  {
    id: 'maintenance',
    label: 'Maintenance',
    services: [
      {
        title: 'Inspection, Testing & Maintenance',
        desc: 'Scheduled pump, sprinkler, alarm, and extinguisher testing with documented deficiency reports.',
        anchor: 'inspection-testing-maintenance',
      },
      {
        title: 'Civil Defense Compliance & Permitting',
        desc: 'Approval drawings, Civil Defense liaison, certificates, and license renewal, end to end.',
        anchor: 'civil-defense-compliance',
      },
      {
        title: 'Retrofit & Upgrade',
        desc: 'Code-edition upgrades, non-compliant remediation, and capacity expansion for growing facilities.',
        anchor: 'retrofit-upgrade',
      },
      {
        title: 'Emergency & Repair Services',
        desc: 'Emergency dispatch, pump and piping repair, and spare parts availability.',
        anchor: 'emergency-repair-services',
      },
      {
        title: 'Training & Consulting',
        desc: 'Extinguisher training, evacuation drills, and ongoing consulting for facility managers.',
        anchor: 'training-consulting',
      },
    ],
  },
]

export default function ServicesTabs({ className = '', delay = 100 }) {
  const [active, setActive] = useState(serviceGroups[0].id)
  const group = serviceGroups.find((g) => g.id === active)

  return (
    <Reveal className={`services-tabs ${className}`} delay={delay}>
      <div className="tab-list" role="tablist" aria-label="Service disciplines">
        {serviceGroups.map((g) => (
          <button
            key={g.id}
            type="button"
            role="tab"
            id={`tab-${g.id}`}
            aria-selected={active === g.id}
            aria-controls={`panel-${g.id}`}
            className="tab-btn"
            onClick={() => setActive(g.id)}
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
          <Link to={`/services/${s.anchor}`} className="tab-service" key={s.title}>
            <h3>{s.title}</h3>
            <p>{s.desc}</p>
            <span className="card-link">View detail &rarr;</span>
          </Link>
        ))}
      </div>
    </Reveal>
  )
}