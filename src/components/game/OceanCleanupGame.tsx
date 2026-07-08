import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import BoatCharacter from './BoatCharacter'
import FloatingTrash from './FloatingTrash'
import MessageBottle from './MessageBottle'
import OceanMessageModal from './OceanMessageModal'
import WaterCanvas, { type WaterCanvasHandle } from './WaterCanvas'
import { useDailyOceanMessage } from './useDailyOceanMessage'
import type { MissionPhase, ScenePoint, TrashItem } from './types'
import './OceanCleanupGame.css'

export interface MissionState {
  phase: MissionPhase
  collected: number
  total: number
}

interface OceanCleanupGameProps {
  onMissionChange?: (state: MissionState) => void
}

const TRASH_ITEMS: TrashItem[] = [
  { id: 'trash-1', type: 'bottle', x: 54, y: 76 },
  { id: 'trash-2', type: 'cup', x: 40, y: 85 },
  { id: 'trash-3', type: 'ring', x: 66, y: 80 },
]

const BOAT_START: ScenePoint = { x: 26, y: 79 }
const BOTTLE_POS: ScenePoint = { x: 82, y: 71 }
const TOTAL_TRASH = TRASH_ITEMS.length

function sceneToPx(x: number, y: number, rect: DOMRect) {
  return { px: (x / 100) * rect.width, py: (y / 100) * rect.height }
}

function PathGuide({ from, to }: { from: ScenePoint; to: ScenePoint }) {
  const dots = useMemo(() => {
    const count = 14
    return Array.from({ length: count }, (_, i) => {
      const t = (i + 1) / (count + 1)
      return {
        x: from.x + (to.x - from.x) * t,
        y: from.y + (to.y - from.y) * t,
        delay: i * 0.06,
      }
    })
  }, [from.x, from.y, to.x, to.y])

  return (
    <svg
      className="ocean-cleanup-game__path"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <filter id="pathGlow">
          <feGaussianBlur stdDeviation="0.4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {dots.map((dot, i) => (
        <motion.circle
          key={i}
          cx={dot.x}
          cy={dot.y}
          r="0.55"
          fill="rgba(255,255,255,0.9)"
          filter="url(#pathGlow)"
          initial={{ opacity: 0.25, scale: 0.6 }}
          animate={{ opacity: [0.3, 0.95, 0.3], scale: [0.7, 1.1, 0.7] }}
          transition={{
            duration: 1.4,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: dot.delay,
          }}
        />
      ))}
    </svg>
  )
}

export default function OceanCleanupGame({ onMissionChange }: OceanCleanupGameProps) {
  const sceneRef = useRef<HTMLDivElement>(null)
  const waterRef = useRef<WaterCanvasHandle>(null)

  const [boatPos, setBoatPos] = useState<ScenePoint>(BOAT_START)
  const [collected, setCollected] = useState<Set<string>>(() => new Set())
  const [isMoving, setIsMoving] = useState(false)
  const [targetId, setTargetId] = useState<string | null>(null)
  const [highlightedId, setHighlightedId] = useState<string | null>(null)
  const [pathTarget, setPathTarget] = useState<ScenePoint | null>(null)
  const [pathOrigin, setPathOrigin] = useState<ScenePoint | null>(null)
  const [boatTilt, setBoatTilt] = useState(0)
  const [collectingId, setCollectingId] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const dailyMessage = useDailyOceanMessage()
  const collectedCount = collected.size
  const bottleUnlocked = collectedCount >= TOTAL_TRASH
  const missionPhase: MissionPhase = bottleUnlocked ? 'bottle' : 'collect'

  useEffect(() => {
    onMissionChange?.({
      phase: missionPhase,
      collected: collectedCount,
      total: TOTAL_TRASH,
    })
  }, [missionPhase, collectedCount, onMissionChange])

  const spawnRipple = useCallback((x: number, y: number, intensity = 1) => {
    const scene = sceneRef.current
    if (!scene) return
    const rect = scene.getBoundingClientRect()
    const waterEl = scene.querySelector('.ocean-cleanup-game__water-canvas')
    const waterH = waterEl?.clientHeight ?? rect.height * 0.42
    const { px } = sceneToPx(x, y, rect)
    const py = ((y - 58) / 42) * waterH
    waterRef.current?.addRipple(px, py, intensity)
  }, [])

  const handleTrashClick = useCallback(
    (item: TrashItem) => {
      if (isMoving || collected.has(item.id)) return

      const stopX = item.x - 8
      const stopY = item.y + 2
      const tilt = Math.max(-10, Math.min(10, (item.x - boatPos.x) * 0.4))

      setPathOrigin(boatPos)
      setTargetId(item.id)
      setHighlightedId(item.id)
      setPathTarget({ x: item.x, y: item.y })
      setBoatTilt(tilt)
      setIsMoving(true)
      setBoatPos({ x: stopX, y: stopY })
    },
    [isMoving, collected, boatPos]
  )

  const handleBoatArrived = useCallback(() => {
    if (!isMoving || !targetId) return

    const item = TRASH_ITEMS.find((t) => t.id === targetId)
    if (item) {
      spawnRipple(item.x, item.y, 1.5)
      setCollectingId(targetId)
    }

    setTargetId(null)
    setHighlightedId(null)
    setPathTarget(null)
    setPathOrigin(null)
    setIsMoving(false)
    setBoatTilt(0)

    window.setTimeout(() => {
      setCollected((prev) => new Set([...prev, targetId]))
      setCollectingId(null)
    }, 520)
  }, [isMoving, targetId, spawnRipple])

  const handleBottleClick = useCallback(() => {
    if (!bottleUnlocked || isMoving) return
    spawnRipple(BOTTLE_POS.x, BOTTLE_POS.y, 1.3)
    setModalOpen(true)
  }, [bottleUnlocked, isMoving, spawnRipple])

  useEffect(() => {
    const interval = window.setInterval(() => {
      TRASH_ITEMS.forEach((item) => {
        if (!collected.has(item.id)) spawnRipple(item.x, item.y, 0.38)
      })
      if (bottleUnlocked) spawnRipple(BOTTLE_POS.x, BOTTLE_POS.y, 0.45)
    }, 2600)
    return () => window.clearInterval(interval)
  }, [collected, bottleUnlocked, spawnRipple])

  return (
    <div className="ocean-cleanup-game" ref={sceneRef}>
      <WaterCanvas
        ref={waterRef}
        className="ocean-cleanup-game__water-canvas"
        moving={isMoving}
        boatX={boatPos.x}
        boatY={boatPos.y}
      />

      {pathTarget && pathOrigin && isMoving && (
        <PathGuide from={pathOrigin} to={pathTarget} />
      )}

      <AnimatePresence>
        {TRASH_ITEMS.map((item) =>
          collected.has(item.id) ? null : (
            <motion.div
              key={item.id}
              className="ocean-cleanup-game__entity"
              style={{ left: `${item.x}%`, top: `${item.y}%` }}
              initial={{ opacity: 1, scale: 1 }}
              animate={
                collectingId === item.id
                  ? { opacity: 0, scale: 0.35, y: 18, rotate: 12 }
                  : { opacity: 1, scale: 1, y: 0, rotate: 0 }
              }
              exit={{ opacity: 0, scale: 0.25, y: 20 }}
              transition={{ duration: 0.52, ease: [0.22, 1, 0.36, 1] }}
            >
              <FloatingTrash
                type={item.type}
                highlighted={highlightedId === item.id}
                onClick={() => handleTrashClick(item)}
              />
            </motion.div>
          )
        )}
      </AnimatePresence>

      <div
        className="ocean-cleanup-game__entity ocean-cleanup-game__entity--bottle"
        style={{ left: `${BOTTLE_POS.x}%`, top: `${BOTTLE_POS.y}%` }}
      >
        <MessageBottle unlocked={bottleUnlocked} onClick={handleBottleClick} />
      </div>

      <motion.div
        className="ocean-cleanup-game__boat-wrap"
        animate={{ left: `${boatPos.x}%`, top: `${boatPos.y}%` }}
        transition={{
          type: 'spring',
          stiffness: 18,
          damping: 11,
          mass: 1.4,
        }}
        onAnimationComplete={() => {
          if (isMoving) handleBoatArrived()
        }}
      >
        <BoatCharacter isMoving={isMoving} tilt={boatTilt} />
      </motion.div>

      <OceanMessageModal
        open={modalOpen}
        message={dailyMessage}
        onClose={() => setModalOpen(false)}
      />
    </div>
  )
}
