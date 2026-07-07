import { motion } from 'framer-motion'

interface BoatCharacterProps {
  isMoving: boolean
  tilt: number
}

export default function BoatCharacter({ isMoving, tilt }: BoatCharacterProps) {
  return (
    <motion.div
      className="ocean-boat"
      animate={
        isMoving
          ? { y: [0, -3, 0], rotate: tilt }
          : { y: [0, -6, 0, -4, 0], rotate: [tilt, tilt + 0.8, tilt, tilt - 0.5, tilt] }
      }
      transition={
        isMoving
          ? { duration: 0.9, repeat: Infinity, ease: 'easeInOut' }
          : { duration: 5, repeat: Infinity, ease: 'easeInOut' }
      }
    >
      <span className={`ocean-boat__wake${isMoving ? ' is-active' : ''}`} aria-hidden="true" />
      <svg viewBox="0 0 200 120" className="ocean-boat__svg" aria-hidden="true">
        <defs>
          <linearGradient id="boatHull" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="55%" stopColor="#eef4fa" />
            <stop offset="100%" stopColor="#d5e2ee" />
          </linearGradient>
          <linearGradient id="boatDeck" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#f8fbff" />
            <stop offset="100%" stopColor="#e8f0f8" />
          </linearGradient>
          <linearGradient id="hoodie" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8b6fd8" />
            <stop offset="100%" stopColor="#5c45b0" />
          </linearGradient>
          <filter id="boatShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#0a0030" floodOpacity="0.35" />
          </filter>
        </defs>

        <ellipse cx="100" cy="102" rx="62" ry="8" fill="rgba(0,0,0,0.18)" />

        <g filter="url(#boatShadow)">
          <path
            d="M28 72 Q100 98 172 72 L164 80 Q100 104 36 80 Z"
            fill="url(#boatHull)"
            stroke="rgba(255,255,255,0.55)"
            strokeWidth="1.2"
          />
          <path d="M36 74 Q100 92 164 74" fill="none" stroke="rgba(180,200,220,0.45)" strokeWidth="1" />
          <path
            d="M42 68 L158 68 L152 74 L46 74 Z"
            fill="url(#boatDeck)"
            opacity="0.9"
          />

          <rect x="138" y="58" width="22" height="12" rx="3" fill="#dce8f4" stroke="rgba(255,255,255,0.5)" />
          <path d="M142 58 L149 48 L156 58" fill="#b8cfe0" />
          <path
            d="M144 62 h10 v4 h-10z"
            fill="none"
            stroke="rgba(100,140,180,0.35)"
            strokeWidth="0.6"
          />

          <circle cx="52" cy="66" r="5" fill="rgba(56,189,248,0.35)" stroke="rgba(255,255,255,0.4)" />
          <path
            d="M48 64 Q50 60 52 64 Q54 60 56 64"
            fill="none"
            stroke="#4ade80"
            strokeWidth="1.5"
            strokeLinecap="round"
          />

          <ellipse cx="26" cy="76" rx="10" ry="3.5" fill="rgba(255,255,255,0.4)" />
          <rect x="22" y="70" width="8" height="3" rx="1" fill="#ff9f5a" opacity="0.85" />

          <ellipse cx="98" cy="58" rx="16" ry="20" fill="url(#hoodie)" />
          <circle cx="98" cy="36" r="14" fill="#f0c9a8" />
          <path d="M84 32 Q98 22 112 32 Q98 28 84 32" fill="#3d2b55" />
          <path d="M88 38 Q98 42 108 38" fill="none" stroke="#c98e72" strokeWidth="1" opacity="0.5" />

          <path d="M118 58 L148 52" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="150" cy="52" r="4" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="0.8" />
        </g>
      </svg>
    </motion.div>
  )
}
