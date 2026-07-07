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

const WATER_SCENE_TOP = 48

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
  const rafRef = useRef(0)
  const timeRef = useRef(0)
  const prevBoatRef = useRef({ x: boatX, y: boatY })

  useImperativeHandle(ref, () => ({
    addRipple(x: number, y: number, intensity = 1) {
      ripplesRef.current.push({
        x,
        y,
        radius: 3,
        maxRadius: 32 + intensity * 28,
        opacity: 0.42 * intensity,
        lineWidth: 1.4,
      })
      if (intensity > 0.8) {
        ripplesRef.current.push({
          x: x + 2,
          y: y + 1,
          radius: 2,
          maxRadius: 18 + intensity * 14,
          opacity: 0.22 * intensity,
          lineWidth: 0.8,
        })
      }
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
    }

    resize()
    window.addEventListener('resize', resize)

    const loop = (time: number) => {
      const dt = timeRef.current ? (time - timeRef.current) / 1000 : 0.016
      timeRef.current = time

      const w = canvas.clientWidth
      const h = canvas.clientHeight
      ctx.clearRect(0, 0, w, h)

      const t = time * 0.001

      const sunGrad = ctx.createLinearGradient(w * 0.55, 0, w, h * 0.35)
      sunGrad.addColorStop(0, 'rgba(200, 220, 255, 0)')
      sunGrad.addColorStop(0.5, 'rgba(180, 200, 255, 0.04)')
      sunGrad.addColorStop(1, 'rgba(160, 190, 255, 0)')
      ctx.fillStyle = sunGrad
      ctx.fillRect(0, 0, w, h)

      for (let band = 0; band < 3; band++) {
        const shimmerY = h * (0.08 + band * 0.12) + Math.sin(t * 0.6 + band) * 4
        const grad = ctx.createLinearGradient(0, shimmerY - 8, 0, shimmerY + 8)
        grad.addColorStop(0, 'rgba(255,255,255,0)')
        grad.addColorStop(0.5, `rgba(220, 235, 255, ${0.035 - band * 0.008})`)
        grad.addColorStop(1, 'rgba(255,255,255,0)')
        ctx.fillStyle = grad
        ctx.fillRect(0, shimmerY - 8, w, 16)
      }

      for (let i = 0; i < 5; i++) {
        ctx.beginPath()
        const yBase = h * (0.08 + i * 0.1)
        const amp = 2.5 + i * 1.2
        const freq = 0.008 + i * 0.002
        const speed = 0.7 + i * 0.12
        ctx.moveTo(0, yBase)
        for (let x = 0; x <= w; x += 10) {
          const y =
            yBase +
            Math.sin(x * freq + t * speed) * amp +
            Math.sin(x * freq * 2.3 + t * speed * 1.4) * (amp * 0.35)
          ctx.lineTo(x, y)
        }
        ctx.strokeStyle = `rgba(255,255,255,${0.055 - i * 0.008})`
        ctx.lineWidth = 1 + i * 0.15
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
        r.radius += dt * 48
        const alpha = r.opacity * (1 - r.radius / r.maxRadius)
        if (alpha <= 0.01) {
          ripplesRef.current.splice(i, 1)
          continue
        }
        ctx.beginPath()
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(230, 245, 255, ${alpha})`
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
        ctx.ellipse(wk.x, wk.y, wk.size * 2.2, wk.size * 0.65, 0, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255,255,255,${alpha * 0.16})`
        ctx.fill()
        ctx.beginPath()
        ctx.ellipse(
          wk.x - wk.vx * 2,
          wk.y - wk.vy * 2,
          wk.size * 1.4,
          wk.size * 0.45,
          0,
          0,
          Math.PI * 2
        )
        ctx.fillStyle = `rgba(255,255,255,${alpha * 0.08})`
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
