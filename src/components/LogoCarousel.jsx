const LOGOS = [
  { name: 'Carina', src: '/logos/Carina.avif', height: 44 },
  { name: 'Decorama', src: '/logos/Decorama.png', height: 52, width: 139 },
  { name: 'FEI', src: '/logos/FEI.png', height: 64, width: 90 },
  { name: 'MC', src: '/logos/MC.png', height: 52 },
  { name: 'Motahida', src: '/logos/Motahida.png', height: 84, width: 89 },
  { name: 'Motahida AC', src: '/logos/MotahidaAC.png', height: 72, width: 153 },
  { name: 'Msrya', src: '/logos/msrya.png', height: 64, width: 46 },
  { name: 'New Cairo', src: '/logos/NewCairo.png', height: 48, width: 125 },
  { name: 'Nour El Hayah', src: '/logos/NourElhayah.jpg', height: 64, width: 64 },
  { name: 'Panda', src: '/logos/Panda.svg', height: 48, width: 126 },
  { name: 'Temsco', src: '/logos/Temsco.png', height: 44, width: 191 },
  { name: 'United', src: '/logos/United.png', height: 96, width: 99 },
  { name: 'ZH', src: '/logos/ZH.png', height: 72, width: 72 },
]

function LogoCarousel() {
  if (LOGOS.length === 0) return null
  const half = LOGOS.length * 2
  const row = [...LOGOS, ...LOGOS, ...LOGOS, ...LOGOS]

  return (
    <section className="logo-carousel-section" aria-label="Client and partner logos">
      <div className="container">
        <p className="logo-carousel-title">Our clients and partners</p>
        <div className="logo-carousel">
          <ul className="logo-track">
            {row.map((logo, i) => (
              <li className="logo-item" key={`${logo.name}-${i}`} aria-hidden={i >= half}>
                <img
                  src={logo.src}
                  alt={i < half ? logo.name : ''}
                  loading="lazy"
                  style={{
                    height: logo.width ? (logo.height ?? 'auto') : logo.height,
                    width: logo.width,
                  }}
                />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

export default LogoCarousel
