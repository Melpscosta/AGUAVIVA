import { useEffect, useRef, useImperativeHandle, forwardRef } from 'react'

export interface WaterCanvasHandle {
  addRipple: (x: number, y: number, intensity?: number) => void
  addWake: (x: number, y: number, angle: number) => void
}

interface Ripple {
  x: number
  y: number
  radius: number
  maxRadius: number
  opacity: number
  lineWidth: number
}

interface Wake {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  size: number
}

interface Glint {
  x: number
  y: number
  len: number
  phase: number
  speed: number
  warm: boolean
}

// Water area begins here (percent of hero height), matching the background
// image horizon and the canvas placement in OceanCleanupGame.css
const WATER_SCENE_TOP = 58

function sceneYToCanvas(y: number, h: number) {
  const t = (y - WATER_SCENE_TOP) / (100 - WATER_SCENE_TOP)
  return Math.max(0, Math.min(h, t * h))
}

interface WaterCanvasProps {
  className?: string
  moving?: boolean
  boatX: number
  boatY: number
}

const WaterCanvas = forwardRef<WaterCanvasHandle, WaterCanvasProps>(function WaterCanvas(
  { className, moving, boatX, boatY },
  ref
) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const ripplesRef = useRef<Ripple[]>([])
  const wakesRef = useRef<Wake[]>([])
  const glintsRef = useRef<Glint[]>([])
  const rafRef = useRef(0)
  const timeRef = useRef(0)
  const prevBoatRef = useRef({ x: boatX, y: boatY })

  useImperativeHandle(ref, () => ({
    addRipple(x: number, y: number, intensity = 1) {
      ripplesRef.current.push({
        x,
        y,
        radius: 3,
        maxRadius: 30 + intensity * 26,
        opacity: 0.32 * intensity,
        lineWidth: 1.2,
      })
    },
    addWake(x: number, y: number, angle: number) {
      wakesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * -0.7,
        vy: Math.sin(angle) * -0.4,
        life: 0,
        maxLife: 0.9 + Math.random() * 0.5,
        size: 4 + Math.random() * 5,
      })
    },
  }))

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      const parent = canvas.parentElement
      if (!parent) return
      const dpr = Math.min(window.devicePixelRatio, 2)
      const w = parent.clientWidth
      const h = parent.clientHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      seedGlints()
    }

    // gentle shimmer segments concentrated on the sun's reflection column
    const seedGlints = () => {
      const w = canvas.clientWidth
      const h = canvas.clientHeight
      const count = Math.max(10, Math.round(w / 46))
      glintsRef.current = Array.from({ length: count }, () => {
        const nearColumn = Math.random() < 0.72
        const x = nearColumn
          ? w * (0.5 + (Math.random() - 0.5) * 0.32)
          : w * Math.random()
        return {
          x,
          y: h * (0.04 + Math.random() * 0.72),
          len: 6 + Math.random() * 22,
          phase: Math.random() * Math.PI * 2,
          speed: 0.5 + Math.random() * 1.1,
          warm: nearColumn,
        }
      })
    }

    resize()
    window.addEventListener('resize', resize)

    // Delicate, soft water: the background image supplies the look; here we add
    // gentle shimmer on the sun reflection plus interactive ripples and wake.
    const loop = (time: number) => {
      const dt = timeRef.current ? (time - timeRef.current) / 1000 : 0.016
      timeRef.current = time

      const w = canvas.clientWidth
      const h = canvas.clientHeight
      ctx.clearRect(0, 0, w, h)

      const t = time * 0.001

      // soft shimmering highlights (thin, low-opacity horizontal glimmers)
      ctx.lineCap = 'round'
      for (const g of glintsRef.current) {
        const tw = (Math.sin(t * g.speed + g.phase) + 1) * 0.5
        const alpha = tw * tw * (g.warm ? 0.26 : 0.12)
        if (alpha < 0.015) continue
        const drift = Math.sin(t * 0.4 + g.phase) * 3
        const len = g.len * (0.7 + tw * 0.5)
        ctx.beginPath()
        ctx.moveTo(g.x - len / 2 + drift, g.y)
        ctx.lineTo(g.x + len / 2 + drift, g.y)
        ctx.strokeStyle = g.warm
          ? `rgba(255, 240, 210, ${alpha})`
          : `rgba(225, 235, 255, ${alpha})`
        ctx.lineWidth = 1.4
        ctx.stroke()
      }

      if (moving) {
        const px = (boatX / 100) * w
        const py = sceneYToCanvas(boatY, h)
        const dx = boatX - prevBoatRef.current.x
        const dy = boatY - prevBoatRef.current.y
        const angle = Math.atan2(dy, dx)
        const dist = Math.hypot(dx, dy)
        if (dist > 0.02) {
          for (let s = 0; s < 2; s++) {
            wakesRef.current.push({
              x: px - Math.cos(angle) * (22 + s * 10),
              y: py - Math.sin(angle) * (12 + s * 6),
              vx: Math.cos(angle + Math.PI) * (0.9 + s * 0.2),
              vy: Math.sin(angle + Math.PI) * (0.55 + s * 0.15),
              life: 0,
              maxLife: 0.7 + s * 0.2,
              size: 5 + s * 2,
            })
          }
        }
      }
      prevBoatRef.current = { x: boatX, y: boatY }

      for (let i = ripplesRef.current.length - 1; i >= 0; i--) {
        const r = ripplesRef.current[i]
        r.radius += dt * 46
        const alpha = r.opacity * (1 - r.radius / r.maxRadius)
        if (alpha <= 0.01) {
          ripplesRef.current.splice(i, 1)
          continue
        }
        ctx.beginPath()
        ctx.ellipse(r.x, r.y, r.radius, r.radius * 0.5, 0, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(235, 245, 255, ${alpha})`
        ctx.lineWidth = r.lineWidth * (1 - r.radius / r.maxRadius * 0.5)
        ctx.stroke()
      }

      for (let i = wakesRef.current.length - 1; i >= 0; i--) {
        const wk = wakesRef.current[i]
        wk.life += dt
        wk.x += wk.vx
        wk.y += wk.vy
        const alpha = 1 - wk.life / wk.maxLife
        if (alpha <= 0) {
          wakesRef.current.splice(i, 1)
          continue
        }
        ctx.beginPath()
        ctx.ellipse(wk.x, wk.y, wk.size * 2.2, wk.size * 0.55, 0, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255,255,255,${alpha * 0.14})`
        ctx.fill()
      }

      rafRef.current = requestAnimationFrame(loop)
    }

    rafRef.current = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [moving, boatX, boatY])

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />
})

export default WaterCanvas
