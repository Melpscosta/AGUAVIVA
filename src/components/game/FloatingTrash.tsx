import { motion } from 'framer-motion'
import type { TrashType } from './types'
import Model3D from './Model3D'

const BOTTLE_MODEL_SRC = `${import.meta.env.BASE_URL}low-poly_empty_plastic_bottle.glb`

interface FloatingTrashProps {
  type: TrashType
  highlighted: boolean
  onClick: () => void
}

function TrashIcon({ type }: { type: TrashType }) {
  const uid = type

  if (type === 'bottle') {
    return (
      <Model3D
        src={BOTTLE_MODEL_SRC}
        className="ocean-trash__model"
        fit={2}
        spinSpeed={0.35}
        bob={0.06}
        rock={0.12}
        tilt={[0.35, 0, 0.25]}
      />
    )
  }

  if (type === 'cup') {
    return (
      <svg viewBox="0 0 52 56" className="ocean-trash__icon" aria-hidden="true">
        <defs>
          <linearGradient id={`tc-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(230,235,245,0.9)" />
            <stop offset="100%" stopColor="rgba(180,190,210,0.55)" />
          </linearGradient>
        </defs>
        <ellipse cx="26" cy="50" rx="14" ry="4" fill="rgba(0,0,0,0.14)" />
        <path
          d="M12 14 h28 l-4 32 a6 6 0 0 1-20 0 Z"
          fill={`url(#tc-${uid})`}
          stroke="rgba(255,255,255,0.45)"
          strokeWidth="1"
        />
        <ellipse cx="26" cy="14" rx="16" ry="5" fill="rgba(255,255,255,0.7)" />
        <path d="M40 18 Q48 24 46 32" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" />
        <rect x="0" y="30" width="52" height="26" fill="rgba(60,40,120,0.22)" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 64 48" className="ocean-trash__icon" aria-hidden="true">
      <ellipse cx="32" cy="42" rx="18" ry="4" fill="rgba(0,0,0,0.12)" />
      <ellipse
        cx="32"
        cy="22"
        rx="26"
        ry="16"
        fill="none"
        stroke="rgba(210,225,245,0.65)"
        strokeWidth="3.5"
      />
      <ellipse
        cx="32"
        cy="22"
        rx="12"
        ry="7"
        fill="none"
        stroke="rgba(190,210,235,0.45)"
        strokeWidth="2"
      />
      <rect x="0" y="26" width="64" height="22" fill="rgba(60,40,120,0.22)" />
    </svg>
  )
}

export default function FloatingTrash({ type, highlighted, onClick }: FloatingTrashProps) {
  const phase = type === 'bottle' ? 0 : type === 'cup' ? 1.2 : 2.4

  return (
    <motion.button
      type="button"
      className={`ocean-trash trash-item${highlighted ? ' is-highlighted' : ''}`}
      onClick={onClick}
      animate={{
        y: [0, -5, 0, -3, 0],
        rotate: [-2, 2, -1, 1, -2],
      }}
      transition={{
        duration: 3.8 + phase,
        repeat: Infinity,
        ease: 'easeInOut',
        delay: phase * 0.3,
      }}
      whileHover={{ scale: 1.1, y: -4 }}
      aria-label="Coletar detrito"
    >
      <span className="ocean-trash__ripple" aria-hidden="true" />
      <TrashIcon type={type} />
      {highlighted && <span className="ocean-trash__glow" aria-hidden="true" />}
    </motion.button>
  )
}
