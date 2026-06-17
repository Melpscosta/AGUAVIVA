import { motion } from 'framer-motion'
import { getWhatsAppUrl } from '../config'
import './Partnerships.css'

function NavatlanticaIcon() {
  return (
    <svg viewBox="0 0 64 64" className="partner-icon" aria-hidden="true">
      <circle cx="32" cy="32" r="26" fill="none" stroke="currentColor" strokeWidth="2.5" />
      <circle cx="32" cy="32" r="5" fill="currentColor" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
        <line
          key={angle}
          x1="32"
          y1="32"
          x2={32 + 26 * Math.cos((angle * Math.PI) / 180)}
          y2={32 + 26 * Math.sin((angle * Math.PI) / 180)}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      ))}
      <circle cx="32" cy="8" r="3" fill="currentColor" />
      <circle cx="32" cy="56" r="3" fill="currentColor" />
      <circle cx="8" cy="32" r="3" fill="currentColor" />
      <circle cx="56" cy="32" r="3" fill="currentColor" />
    </svg>
  )
}

function SerpentinaIcon() {
  return (
    <svg viewBox="0 0 64 64" className="partner-icon" aria-hidden="true">
      <path
        d="M12 48 C12 48 18 12 32 28 C46 44 52 16 52 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <circle cx="12" cy="48" r="4" fill="currentColor" />
      <circle cx="52" cy="16" r="4" fill="currentColor" />
    </svg>
  )
}

function EcotechIcon() {
  return (
    <svg viewBox="0 0 64 64" className="partner-icon" aria-hidden="true">
      <circle cx="32" cy="32" r="18" fill="none" stroke="currentColor" strokeWidth="2.5" />
      {[0, 60, 120, 180, 240, 300].map((angle) => (
        <line
          key={angle}
          x1={32 + 10 * Math.cos((angle * Math.PI) / 180)}
          y1={32 + 10 * Math.sin((angle * Math.PI) / 180)}
          x2={32 + 22 * Math.cos((angle * Math.PI) / 180)}
          y2={32 + 22 * Math.sin((angle * Math.PI) / 180)}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      ))}
      <circle cx="32" cy="32" r="6" fill="currentColor" />
      <line x1="32" y1="14" x2="32" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="48" y1="24" x2="56" y2="20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="16" y1="40" x2="8" y2="44" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="32" cy="6" r="2.5" fill="currentColor" />
      <circle cx="56" cy="20" r="2.5" fill="currentColor" />
      <circle cx="8" cy="44" r="2.5" fill="currentColor" />
    </svg>
  )
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" className="whatsapp-icon" aria-hidden="true">
      <path
        fill="currentColor"
        d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"
      />
      <path
        fill="currentColor"
        d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.532 5.855L0 24l6.335-1.662A11.95 11.95 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.79 9.79 0 01-4.99-1.366l-.357-.212-3.76.986 1.004-3.666-.233-.375A9.818 9.818 0 012.182 12c0-5.422 4.396-9.818 9.818-9.818S21.818 6.578 21.818 12 17.422 21.818 12 21.818z"
      />
    </svg>
  )
}

const PARTNERS = [
  { name: 'NAVATLÂNTICA', Icon: NavatlanticaIcon },
  { name: 'Serpentina', Icon: SerpentinaIcon },
  { name: 'ecotech innovations', Icon: EcotechIcon },
]

export default function Partnerships() {
  return (
    <section className="partnerships" id="parcerias" aria-label="Parcerias">
      <div className="partnerships__ambient" aria-hidden="true">
        <div className="partnerships__glow" />
        {[
          { left: '14%', size: 4, delay: 0 },
          { left: '68%', size: 5, delay: 3 },
          { left: '42%', size: 3, delay: 6 },
        ].map((bubble, i) => (
          <span
            key={i}
            className="partnerships__bubble"
            style={
              {
                left: bubble.left,
                width: bubble.size,
                height: bubble.size,
                animationDelay: `${bubble.delay}s`,
              } as React.CSSProperties
            }
          />
        ))}
      </div>

      <div className="partnerships__container">
        <motion.header
          className="partnerships__header"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <h2 className="partnerships__title">Parcerias</h2>
          <p className="partnerships__text">
            Empresas parceiras do ÁguaViva apoiam a preservação marinha oferecendo hospedagem,
            alimentação, transporte ou experiências aos voluntários. Em troca, fortalecem sua imagem
            sustentável e fazem parte de uma rede de impacto positivo pelos oceanos.
          </p>
        </motion.header>

        <motion.div
          className="partnerships__cta"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.06 }}
        >
          <p className="partnerships__cta-text">
            Sua empresa pode fazer parte dessa rede de impacto positivo pelos oceanos.
          </p>
          <a
            className="partnerships__whatsapp"
            href={getWhatsAppUrl()}
            target="_blank"
            rel="noopener noreferrer"
          >
            <WhatsAppIcon />
            Junte-se a nós
          </a>
        </motion.div>

        <motion.div
          className="partnerships__partners"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.08 }}
        >
          <h3 className="partnerships__subtitle">Nossos Parceiros</h3>
          <ul className="partnerships__list">
            {PARTNERS.map(({ name, Icon }) => (
              <li key={name} className="partner-item">
                <div className="partner-item__halo">
                  <Icon />
                </div>
                <span className="partner-item__name">{name}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </section>
  )
}
