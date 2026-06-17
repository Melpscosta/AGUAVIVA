import { motion } from 'framer-motion'
import './ScrollIndicator.css'

function MouseIcon() {
  return (
    <svg className="scroll-indicator__mouse" viewBox="0 0 24 36" aria-hidden="true">
      <rect
        x="6"
        y="2"
        width="12"
        height="22"
        rx="6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
      />
      <motion.line
        x1="12"
        y1="7"
        x2="12"
        y2="12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        animate={{ y1: [7, 10, 7], y2: [12, 15, 12] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
      />
    </svg>
  )
}

export default function ScrollIndicator() {
  return (
    <div className="scroll-indicator" aria-hidden="true">
      <MouseIcon />
      <motion.span
        className="scroll-indicator__chevron"
        animate={{ y: [0, 6, 0] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
      >
        ▾
      </motion.span>
      <span className="scroll-indicator__text">SCROLL DOWN</span>
    </div>
  )
}
