import { motion } from 'framer-motion'

interface MessageBottleProps {
  unlocked: boolean
  onClick: () => void
}

export default function MessageBottle({ unlocked, onClick }: MessageBottleProps) {
  return (
    <motion.button
      type="button"
      className={`ocean-bottle message-bottle${unlocked ? ' is-unlocked' : ' is-locked'}`}
      onClick={onClick}
      disabled={!unlocked}
      animate={{ y: [0, -6, 0, -4, 0], rotate: [-1, 1, 0, -0.5, -1] }}
      transition={{ duration: 4.8, repeat: Infinity, ease: 'easeInOut' }}
      whileHover={unlocked ? { scale: 1.06 } : undefined}
      aria-label={unlocked ? 'Abrir mensagem do oceano' : 'Garrafa bloqueada'}
    >
      <span className="ocean-bottle__ripple" aria-hidden="true" />
      <svg viewBox="0 0 80 112" className="ocean-bottle__svg" aria-hidden="true">
        <defs>
          <linearGradient id="msgBottleGlass" x1="0.2" y1="0" x2="0.8" y2="1">
            <stop offset="0%" stopColor="rgba(255,240,200,0.85)" />
            <stop offset="45%" stopColor="rgba(255,210,140,0.55)" />
            <stop offset="100%" stopColor="rgba(220,170,90,0.35)" />
          </linearGradient>
          <linearGradient id="msgBottleShine" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgba(255,255,255,0)" />
            <stop offset="40%" stopColor="rgba(255,255,255,0.55)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </linearGradient>
          <filter id="bottleGlow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <ellipse cx="40" cy="104" rx="22" ry="5" fill="rgba(0,0,0,0.2)" />

        <g filter={unlocked ? 'url(#bottleGlow)' : undefined}>
          <path
            d="M30 34h20v10c0 5 10 10 10 24v30c0 7-6 12-14 12s-14-5-14-12V68c0-14 10-19 10-24V34z"
            fill="url(#msgBottleGlass)"
            stroke="rgba(255,220,160,0.65)"
            strokeWidth="1.2"
          />
          <rect x="32" y="22" width="16" height="12" rx="2" fill="rgba(200,170,120,0.85)" />
          <ellipse cx="40" cy="22" rx="11" ry="4" fill="rgba(170,140,90,0.95)" />
          <ellipse cx="40" cy="20" rx="8" ry="2.5" fill="rgba(140,110,70,0.9)" />

          <rect x="36" y="52" width="8" height="28" rx="2" fill="rgba(255,250,235,0.9)" />
          <path
            d="M37 54 L39 58 L37 62 M41 56 L43 60 L41 64 M37 68 L39 72 L37 76"
            stroke="rgba(190,150,90,0.45)"
            strokeWidth="0.6"
            fill="none"
          />

          <rect x="22" y="30" width="10" height="50" rx="5" fill="url(#msgBottleShine)" opacity="0.5" />
        </g>

        <rect x="0" y="72" width="80" height="40" fill="rgba(50,30,100,0.18)" />
      </svg>
      {unlocked && <span className="ocean-bottle__shine" aria-hidden="true" />}
      {!unlocked && <span className="ocean-bottle__lock" aria-hidden="true" />}
    </motion.button>
  )
}
