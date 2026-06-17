import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion'
import Fish from './Fish'
import './FishGuide.css'

type FishPhase = 'hidden' | 'swimming' | 'jumping' | 'splashed'

interface Point {
  x: number
  y: number
}

interface FishGuideProps {
  sectionRef: React.RefObject<HTMLElement | null>
  anchorRefs: React.RefObject<(HTMLElement | null)[]>
  buttonRef: React.RefObject<HTMLButtonElement | null>
  onRevealStep: (step: number) => void
  onSplash: () => void
}

const FISH_W = 88
const FISH_H = 36

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function easeInOutSine(t: number) {
  return -(Math.cos(Math.PI * clamp(t, 0, 1)) - 1) / 2
}

/** Desacelera perto dos waypoints para sensação de pausa */
function segmentEase(t: number) {
  const x = clamp(t, 0, 1)
  if (x < 0.15) return easeInOutSine(x / 0.15) * 0.12
  if (x > 0.85) return 0.88 + easeInOutSine((x - 0.85) / 0.15) * 0.12
  return 0.12 + easeInOutSine((x - 0.15) / 0.7) * 0.76
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

function verticalPoint(from: Point, to: Point, t: number): Point {
  const eased = segmentEase(t)
  return {
    x: lerp(from.x, to.x, eased),
    y: lerp(from.y, to.y, eased),
  }
}

export default function FishGuide({
  sectionRef,
  anchorRefs,
  buttonRef,
  onRevealStep,
  onSplash,
}: FishGuideProps) {
  const [phase, setPhase] = useState<FishPhase>('hidden')
  const [facingLeft, setFacingLeft] = useState(false)
  const [swimTilt, setSwimTilt] = useState(0)
  const hasSplashed = useRef(false)
  const revealedRef = useRef<Set<number>>(new Set())
  const phaseRef = useRef<FishPhase>('hidden')
  const floatPhaseRef = useRef(0)

  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springX = useSpring(x, { stiffness: 5, damping: 18, mass: 2.6 })
  const springY = useSpring(y, { stiffness: 5, damping: 18, mass: 2.6 })
  const tilt = useSpring(swimTilt, { stiffness: 16, damping: 18 })

  const getWaypoints = useCallback((): Point[] => {
    const vw = window.innerWidth
    const sideOffset = vw > 768 ? Math.min(vw * 0.12, 100) : 0
    const points: Point[] = []

    anchorRefs.current.forEach((el) => {
      if (!el) return
      const rect = el.getBoundingClientRect()
      points.push({
        x: rect.left + rect.width / 2 - FISH_W / 2 + sideOffset,
        y: rect.top + rect.height / 2 - FISH_H / 2,
      })
    })

    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      points.push({
        x: rect.left + rect.width / 2 - FISH_W / 2,
        y: rect.top - FISH_H - 6,
      })
    }

    return points
  }, [anchorRefs, buttonRef])

  const setPhaseSafe = (next: FishPhase) => {
    phaseRef.current = next
    setPhase(next)
  }

  const updateFromScroll = useCallback(() => {
    const section = sectionRef.current
    if (!section) return

    const sectionRect = section.getBoundingClientRect()
    const sectionTop = window.scrollY + sectionRect.top
    const scrollable = Math.max(section.offsetHeight - window.innerHeight * 0.45, 1)
    const rawProgress =
      (window.scrollY - sectionTop + window.innerHeight * 0.32) / scrollable
    const progress = clamp(rawProgress, 0, 1)

    if (sectionRect.bottom < 0 || sectionRect.top > window.innerHeight) {
      if (sectionRect.top > window.innerHeight) setPhaseSafe('hidden')
      return
    }

    if (phaseRef.current === 'splashed') return

    const waypoints = getWaypoints()
    if (waypoints.length < 1) return

    if (phaseRef.current === 'hidden') setPhaseSafe('swimming')

    if (phaseRef.current !== 'swimming') return

    const segments = Math.max(waypoints.length - 1, 1)
    const scaled = progress * segments

    const segmentIndex = Math.min(Math.floor(scaled), segments - 1)
    const segmentT = scaled - segmentIndex
    const from = waypoints[segmentIndex]
    const to = waypoints[Math.min(segmentIndex + 1, waypoints.length - 1)]
    const pos = waypoints.length === 1 ? waypoints[0] : verticalPoint(from, to, segmentT)

    floatPhaseRef.current += 0.035
    const idleFloat = Math.sin(floatPhaseRef.current) * 2

    x.set(pos.x)
    y.set(pos.y + idleFloat)

    setFacingLeft(false)
    setSwimTilt(Math.sin(floatPhaseRef.current * 1.2) * 2)

    const stepCount = anchorRefs.current.length
    for (let i = 0; i < stepCount; i++) {
      const approachThreshold = i + 0.35
      if (scaled >= approachThreshold && !revealedRef.current.has(i + 1)) {
        revealedRef.current.add(i + 1)
        onRevealStep(i + 1)
      }
    }

    if (scaled >= segments - 0.06 && buttonRef.current && !hasSplashed.current) {
      const btnRect = buttonRef.current.getBoundingClientRect()
      setPhaseSafe('jumping')
      x.set(btnRect.left + btnRect.width / 2 - FISH_W / 2)
      y.set(btnRect.top + btnRect.height / 2 - FISH_H / 2)

      setTimeout(() => {
        if (!hasSplashed.current) {
          hasSplashed.current = true
          setPhaseSafe('splashed')
          onSplash()
        }
      }, 850)
    }
  }, [sectionRef, anchorRefs, buttonRef, getWaypoints, onRevealStep, onSplash, x, y])

  useEffect(() => {
    let raf = 0
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(updateFromScroll)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [updateFromScroll])

  return (
    <AnimatePresence>
      {(phase === 'swimming' || phase === 'jumping') && (
        <motion.div
          className="fish-guide"
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{
            opacity: phase === 'jumping' ? [1, 1, 0] : 1,
            scale: phase === 'jumping' ? [1, 1.08, 0.1] : 1,
            rotate: phase === 'jumping' ? [0, -18, 10] : undefined,
          }}
          exit={{ opacity: 0, transition: { duration: 0.5 } }}
          transition={{
            opacity: phase === 'jumping' ? { duration: 0.9, times: [0, 0.5, 1] } : { duration: 0.7 },
            scale:
              phase === 'jumping'
                ? { duration: 0.9, ease: [0.34, 1.3, 0.64, 1] }
                : { duration: 0.5 },
            rotate: phase === 'jumping' ? { duration: 0.9, ease: 'easeInOut' } : undefined,
          }}
          style={{
            position: 'fixed',
            zIndex: 50,
            pointerEvents: 'none',
            left: springX,
            top: springY,
            rotate: phase === 'swimming' ? tilt : undefined,
          }}
        >
          <Fish facingLeft={facingLeft} swimming={phase === 'swimming'} />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
