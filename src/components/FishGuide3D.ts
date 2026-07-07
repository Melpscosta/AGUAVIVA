import * as THREE from 'three'

export interface FishAnchors {
  step1: HTMLElement | null
  step2: HTMLElement | null
  step3: HTMLElement | null
  cta: HTMLElement | null
  stage?: HTMLElement | null
}

export interface FishGuideState {
  progress: number
  activeStep: number
  ctaHighlight: boolean
  divePhase: number
}

interface TrailParticle {
  mesh: THREE.Mesh
  life: number
  maxLife: number
  vx: number
  vy: number
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

function easeInOutCubic(t: number) {
  const x = clamp(t, 0, 1)
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2
}

function easeInOutSine(t: number) {
  return -(Math.cos(Math.PI * clamp(t, 0, 1)) - 1) / 2
}

function lerpAngle(a: number, b: number, t: number) {
  let diff = b - a
  while (diff > Math.PI) diff -= Math.PI * 2
  while (diff < -Math.PI) diff += Math.PI * 2
  return a + diff * t
}

export function getFishPixelSize(): number {
  const vw = window.innerWidth
  if (vw <= 640) return clamp(vw * 0.2, 64, 90)
  if (vw <= 1024) return clamp(vw * 0.1, 80, 110)
  return clamp(vw * 0.085, 90, 140)
}

function getLateralOffset(): number {
  const vw = window.innerWidth
  if (vw <= 640) return clamp(vw * 0.06, 28, 48)
  if (vw <= 1024) return clamp(vw * 0.09, 56, 80)
  return clamp(vw * 0.11, 80, 130)
}

function createFinShape(): THREE.Shape {
  const shape = new THREE.Shape()
  shape.moveTo(0, 0)
  shape.quadraticCurveTo(0.4, 0.5, 0.9, 0.18)
  shape.quadraticCurveTo(0.6, -0.04, 0, 0)
  return shape
}

function createTailShape(): THREE.Shape {
  const shape = new THREE.Shape()
  shape.moveTo(0, 0)
  shape.quadraticCurveTo(0.2, 0.65, 0.75, 0.42)
  shape.quadraticCurveTo(0.5, 0.08, 0, 0)
  return shape
}

export class FishGuide3D {
  private container: HTMLElement | null = null
  private scene: THREE.Scene | null = null
  private camera: THREE.OrthographicCamera | null = null
  private renderer: THREE.WebGLRenderer | null = null

  private fishGroup: THREE.Group | null = null
  private body: THREE.Mesh | null = null
  private head: THREE.Mesh | null = null
  private tailGroup: THREE.Group | null = null
  private tailFinTop: THREE.Mesh | null = null
  private tailFinBottom: THREE.Mesh | null = null
  private leftFin: THREE.Mesh | null = null
  private rightFin: THREE.Mesh | null = null
  private dorsalFin: THREE.Mesh | null = null
  private trailGroup: THREE.Group | null = null

  private bodyMaterial: THREE.MeshPhongMaterial | null = null
  private finMaterial: THREE.MeshPhongMaterial | null = null
  private eyeMaterial: THREE.MeshPhongMaterial | null = null
  private trailMaterial: THREE.MeshPhongMaterial | null = null

  private disposed = false
  private lastTime = 0
  private progress = 0
  private swimIntensity = 0.3
  private facingYaw = 0
  private targetFacingYaw = 0
  private velocityX = 0
  private velocityY = 0
  private prevX = 0
  private prevY = 0
  private screenX = 0
  private screenY = 0
  private targetX = 0
  private targetY = 0
  private floatOffset = 0
  private reducedMotion = false

  private trailParticles: TrailParticle[] = []
  private trailCooldown = 0
  private divePhase = 0
  private ctaHighlight = false
  private splashFired = false

  init(container: HTMLElement, canvas?: HTMLCanvasElement) {
    this.container = container
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    this.createScene(canvas)
    this.createFish()
    this.resize()
  }

  createScene(existingCanvas?: HTMLCanvasElement) {
    if (!this.container) return

    this.scene = new THREE.Scene()

    const w = this.container.clientWidth || window.innerWidth
    const h = this.container.clientHeight || window.innerHeight

    this.camera = new THREE.OrthographicCamera(-w / 2, w / 2, h / 2, -h / 2, 0.1, 100)
    this.camera.position.z = 10

    this.renderer = new THREE.WebGLRenderer({
      canvas: existingCanvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    })
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.setClearColor(0x000000, 0)

    if (!existingCanvas) {
      this.container.appendChild(this.renderer.domElement)
    }

    const el = this.renderer.domElement
    el.classList.add('fish-guide-canvas')
    el.style.pointerEvents = 'none'

    const ambient = new THREE.AmbientLight(0xb8e8ff, 0.9)
    const key = new THREE.DirectionalLight(0xffffff, 0.85)
    key.position.set(2, 3, 4)
    const fill = new THREE.DirectionalLight(0x7ec8e8, 0.4)
    fill.position.set(-2, -1, 2)

    this.scene.add(ambient, key, fill)
  }

  createFish() {
    if (!this.scene) return

    this.bodyMaterial = new THREE.MeshPhongMaterial({
      color: 0xf0faff,
      emissive: 0x6eb8d8,
      emissiveIntensity: 0.06,
      shininess: 70,
      specular: 0xb8e8ff,
    })

    this.finMaterial = new THREE.MeshPhongMaterial({
      color: 0x9fdcf0,
      emissive: 0x3b9ec8,
      emissiveIntensity: 0.05,
      transparent: true,
      opacity: 0.55,
      side: THREE.DoubleSide,
      depthWrite: false,
      shininess: 45,
    })

    this.eyeMaterial = new THREE.MeshPhongMaterial({
      color: 0x38bdf8,
      emissive: 0x0ea5e9,
      emissiveIntensity: 0.4,
      shininess: 90,
    })

    this.trailMaterial = new THREE.MeshPhongMaterial({
      color: 0xc8f0ff,
      transparent: true,
      opacity: 0.35,
      shininess: 80,
    })

    this.fishGroup = new THREE.Group()

    this.body = new THREE.Mesh(new THREE.SphereGeometry(0.5, 32, 24), this.bodyMaterial)
    this.body.scale.set(2.2, 0.65, 0.55)
    this.body.position.set(-0.04, 0, 0)

    this.head = new THREE.Mesh(new THREE.SphereGeometry(0.38, 28, 22), this.bodyMaterial)
    this.head.position.set(0.82, 0.03, 0)
    this.head.scale.set(1.05, 0.9, 0.85)

    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.07, 14, 14), this.eyeMaterial)
    eye.position.set(1.05, 0.09, 0.19)
    const eyeBack = eye.clone()
    eyeBack.position.z = -0.19

    const dorsalShape = new THREE.Shape()
    dorsalShape.moveTo(0, 0)
    dorsalShape.quadraticCurveTo(0.22, 0.58, 0.68, 0.38)
    dorsalShape.quadraticCurveTo(0.38, 0.06, 0, 0)
    this.dorsalFin = new THREE.Mesh(new THREE.ShapeGeometry(dorsalShape), this.finMaterial)
    this.dorsalFin.position.set(0.08, 0.4, 0)
    this.dorsalFin.rotation.x = -0.3
    this.dorsalFin.scale.set(0.58, 0.58, 0.58)

    const pectoralGeo = new THREE.ShapeGeometry(createFinShape())
    this.leftFin = new THREE.Mesh(pectoralGeo, this.finMaterial)
    this.leftFin.position.set(0.38, -0.06, 0.36)
    this.leftFin.rotation.set(0.35, 0.3, -0.55)
    this.leftFin.scale.set(0.44, 0.44, 0.44)

    this.rightFin = new THREE.Mesh(pectoralGeo.clone(), this.finMaterial)
    this.rightFin.position.set(0.38, -0.06, -0.36)
    this.rightFin.rotation.set(-0.35, -0.3, 0.55)
    this.rightFin.scale.set(0.44, 0.44, 0.44)

    this.tailGroup = new THREE.Group()
    this.tailGroup.position.set(-1.05, 0, 0)

    const tailGeo = new THREE.ShapeGeometry(createTailShape())
    this.tailFinTop = new THREE.Mesh(tailGeo, this.finMaterial)
    this.tailFinTop.position.set(-0.04, 0.04, 0.1)
    this.tailFinTop.rotation.set(0, 0.2, 0)

    this.tailFinBottom = new THREE.Mesh(tailGeo.clone(), this.finMaterial)
    this.tailFinBottom.position.set(-0.04, 0.04, -0.1)
    this.tailFinBottom.rotation.set(0, -0.2, Math.PI)

    this.tailGroup.add(this.tailFinTop, this.tailFinBottom)
    this.trailGroup = new THREE.Group()

    this.fishGroup.add(
      this.body,
      this.head,
      eye,
      eyeBack,
      this.dorsalFin,
      this.leftFin,
      this.rightFin,
      this.tailGroup,
      this.trailGroup
    )

    this.scene.add(this.fishGroup)
    this.applyFishScale()
  }

  private applyFishScale() {
    if (!this.fishGroup) return
    this.fishGroup.scale.setScalar(getFishPixelSize() / 115)
  }

  getWorldPositionFromElement(element: HTMLElement, offsetX = 0, offsetY = 0) {
    if (!this.container) return { x: 0, y: 0 }

    const containerRect = this.container.getBoundingClientRect()
    const rect = element.getBoundingClientRect()
    const fishH = getFishPixelSize() * 0.55

    const px = rect.left + rect.width / 2 - containerRect.left + offsetX
    const py = rect.top + rect.height / 2 - containerRect.top - fishH / 2 + offsetY

    return {
      x: px - containerRect.width / 2,
      y: containerRect.height / 2 - py,
    }
  }

  private computePathTarget(progress: number, anchors: FishAnchors) {
    const lateral = getLateralOffset()
    const mobile = window.innerWidth <= 640
    const w = this.container?.clientWidth ?? window.innerWidth

    const stage = anchors.stage
      ? this.getWorldPositionFromElement(anchors.stage, 0, 0)
      : { x: 0, y: 0 }

    const s1 = { x: stage.x - (mobile ? lateral * 0.55 : lateral), y: stage.y }
    const s2 = { x: stage.x + (mobile ? lateral * 0.55 : lateral), y: stage.y }
    const s3 = { x: stage.x - (mobile ? lateral * 0.45 : lateral * 0.85), y: stage.y }
    const cta = anchors.cta
      ? this.getWorldPositionFromElement(anchors.cta, 0, mobile ? -8 : -12)
      : { x: stage.x, y: stage.y - 200 }

    const enter = { x: -w / 2 - getFishPixelSize(), y: s1.y }
    const p = clamp(progress, 0, 1)

    let x = enter.x
    let y = enter.y
    let facing: 'left' | 'right' = 'right'
    let dive = 0
    let highlight = false

    if (p < 0.14) {
      const t = easeInOutSine(p / 0.14)
      x = lerp(enter.x, s1.x, t)
      y = s1.y + Math.sin(t * Math.PI) * 8
      facing = 'right'
    } else if (p < 0.3) {
      const t = easeInOutCubic((p - 0.14) / 0.16)
      x = lerp(s1.x, s1.x + (mobile ? 6 : 12), t)
      y = s1.y + Math.sin(t * Math.PI * 2) * 3
      facing = 'right'
    } else if (p < 0.5) {
      const t = easeInOutCubic((p - 0.3) / 0.2)
      x = lerp(s1.x, s2.x, t)
      y = s2.y + Math.sin(t * Math.PI) * (mobile ? 6 : 12)
      facing = t < 0.45 ? 'right' : 'left'
    } else if (p < 0.68) {
      const t = easeInOutCubic((p - 0.5) / 0.18)
      x = lerp(s2.x, s3.x, t)
      y = s3.y + Math.sin(t * Math.PI) * (mobile ? 4 : 8)
      facing = 'left'
    } else {
      const t = easeInOutCubic((p - 0.68) / 0.32)
      x = lerp(s3.x, cta.x, t) + Math.sin(t * Math.PI) * (mobile ? 12 : 22)
      y =
        t < 0.5
          ? lerp(s3.y, cta.y + (mobile ? 30 : 48), easeInOutCubic(t / 0.5))
          : lerp(cta.y + (mobile ? 30 : 48), cta.y, easeInOutCubic((t - 0.5) / 0.5))
      facing = 'right'
      dive = clamp((p - 0.88) / 0.12, 0, 1)
      highlight = p > 0.9
    }

    return { x, y, facing, dive, highlight }
  }

  updateTimeline(progress: number, anchors: FishAnchors) {
    this.progress = clamp(progress, 0, 1)

    if (this.reducedMotion) {
      const cta = anchors.cta
      if (cta) {
        const pos = this.getWorldPositionFromElement(cta, 0, -50)
        this.targetX = pos.x
        this.targetY = pos.y
      }
      this.divePhase = 0
      this.ctaHighlight = this.progress > 0.85
      this.targetFacingYaw = 0
      return
    }

    const path = this.computePathTarget(this.progress, anchors)
    this.targetX = path.x
    this.targetY = path.y
    this.targetFacingYaw = path.facing === 'left' ? Math.PI : 0
    this.divePhase = path.dive
    this.ctaHighlight = path.highlight

    if (path.highlight && !this.splashFired) {
      this.splashFired = true
      this.spawnBubbleBurst(6)
    }
    if (!path.highlight) {
      this.splashFired = false
    }
  }

  moveAlongPath(progress: number, anchors: FishAnchors) {
    this.updateTimeline(progress, anchors)

    const lag = this.reducedMotion ? 1 : 0.14
    this.screenX = lerp(this.screenX, this.targetX, lag)
    this.screenY = lerp(this.screenY, this.targetY, lag)
  }

  diveIntoCTA(progress: number) {
    this.divePhase = clamp(progress, 0, 1)
  }

  updateFishParts(time: number, intensity: number) {
    if (!this.fishGroup || !this.tailGroup) return

    const t = time * 0.001
    const tailSpeed = 6.5 + intensity * 5
    const tailAmp = 0.22 + intensity * 0.35
    const finAmp = 0.12 + intensity * 0.16

    this.tailGroup.rotation.y = Math.sin(t * tailSpeed) * tailAmp
    if (this.tailFinTop) this.tailFinTop.rotation.z = Math.sin(t * tailSpeed + 0.4) * (0.18 + intensity * 0.15)
    if (this.tailFinBottom)
      this.tailFinBottom.rotation.z = -Math.sin(t * tailSpeed + 0.4) * (0.18 + intensity * 0.15)

    if (this.dorsalFin) {
      this.dorsalFin.rotation.z = Math.sin(t * (4.5 + intensity * 2)) * 0.07
    }
    if (this.leftFin) {
      this.leftFin.rotation.z = -0.55 + Math.sin(t * (5.5 + intensity * 2)) * finAmp
    }
    if (this.rightFin) {
      this.rightFin.rotation.z = 0.55 - Math.sin(t * (5.5 + intensity * 2)) * finAmp
    }

    if (this.body) {
      this.body.rotation.z = Math.sin(t * 4.2) * (0.02 + intensity * 0.03)
      this.body.position.y = Math.sin(t * 3.4) * 0.015
    }
    if (this.head) {
      this.head.rotation.y = Math.sin(t * 4.8) * (0.03 + intensity * 0.025)
    }

    this.floatOffset = Math.sin(t * 2.6) * (0.02 + (1 - intensity) * 0.02)
  }

  private spawnTrailParticle() {
    if (!this.trailGroup || !this.trailMaterial) return

    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.025 + Math.random() * 0.02, 6, 6),
      this.trailMaterial
    )
    mesh.position.set(-1.05, 0.04, (Math.random() - 0.5) * 0.12)
    this.trailGroup.add(mesh)

    this.trailParticles.push({
      mesh,
      life: 0,
      maxLife: 0.5 + Math.random() * 0.35,
      vx: -0.018 - Math.random() * 0.015,
      vy: (Math.random() - 0.5) * 0.012,
    })
  }

  private spawnBubbleBurst(count: number) {
    if (!this.trailGroup || !this.trailMaterial) return

    for (let i = 0; i < count; i++) {
      const mat = this.trailMaterial.clone()
      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.035 + Math.random() * 0.025, 8, 8),
        mat
      )
      mesh.position.set(-0.15 + (Math.random() - 0.5) * 0.25, 0, (Math.random() - 0.5) * 0.15)
      this.trailGroup.add(mesh)

      this.trailParticles.push({
        mesh,
        life: 0,
        maxLife: 0.7 + Math.random() * 0.4,
        vx: (Math.random() - 0.5) * 0.03,
        vy: 0.015 + Math.random() * 0.025,
      })
    }
  }

  private updateTrail(dt: number) {
    if (!this.trailGroup) return

    this.trailCooldown -= dt
    if (this.swimIntensity > 0.4 && this.trailCooldown <= 0 && this.divePhase < 0.5) {
      this.spawnTrailParticle()
      this.trailCooldown = 110
    }

    for (let i = this.trailParticles.length - 1; i >= 0; i--) {
      const p = this.trailParticles[i]
      p.life += dt * 0.001
      p.mesh.position.x += p.vx
      p.mesh.position.y += p.vy
      ;(p.mesh.material as THREE.MeshPhongMaterial).opacity = (1 - p.life / p.maxLife) * 0.4

      if (p.life >= p.maxLife) {
        this.trailGroup.remove(p.mesh)
        p.mesh.geometry.dispose()
        ;(p.mesh.material as THREE.Material).dispose()
        this.trailParticles.splice(i, 1)
      }
    }
  }

  getGuideState(): FishGuideState {
    let activeStep = 0
    const p = this.progress
    if (p >= 0.5) activeStep = 3
    else if (p >= 0.3) activeStep = 2
    else if (p >= 0.14) activeStep = 1

    return {
      progress: p,
      activeStep,
      ctaHighlight: this.ctaHighlight,
      divePhase: this.divePhase,
    }
  }

  update(time: number) {
    if (this.disposed || !this.renderer || !this.scene || !this.camera || !this.fishGroup) return

    const dt = this.lastTime ? time - this.lastTime : 16
    this.lastTime = time

    this.prevX = this.screenX
    this.prevY = this.screenY

    this.velocityX = (this.screenX - this.prevX) / Math.max(dt, 1)
    this.velocityY = (this.screenY - this.prevY) / Math.max(dt, 1)
    const speed = Math.hypot(this.velocityX, this.velocityY)
    this.swimIntensity = this.reducedMotion ? 0.25 : clamp(speed / 80, 0.28, 1)

    const turnSpeed = this.reducedMotion ? 1 : clamp(dt * 0.005, 0.035, 0.12)
    this.facingYaw = lerpAngle(this.facingYaw, this.targetFacingYaw, turnSpeed)

    const bank = clamp(this.velocityX * 0.0005 + this.velocityY * 0.0002, -0.16, 0.16)
    const pitch = clamp(-this.velocityY * 0.0003, -0.1, 0.1)
    const baseScale = getFishPixelSize() / 115

    this.fishGroup.rotation.y = this.facingYaw

    if (this.divePhase > 0) {
      const d = easeInOutCubic(this.divePhase)
      this.fishGroup.rotation.z = lerp(bank, -0.35, d)
      this.fishGroup.rotation.x = lerp(pitch, 0.25, d)
      this.fishGroup.scale.setScalar(baseScale * lerp(1, 0.38, d))
      this.fishGroup.position.set(this.screenX, this.screenY + lerp(this.floatOffset, -0.18, d), 0)
    } else {
      this.fishGroup.rotation.z = lerp(this.fishGroup.rotation.z, bank, 0.1)
      this.fishGroup.rotation.x = lerp(this.fishGroup.rotation.x, pitch, 0.08)
      this.fishGroup.scale.setScalar(baseScale)
      this.fishGroup.position.set(this.screenX, this.screenY + this.floatOffset, 0)
    }

    this.updateFishParts(time, this.swimIntensity)
    this.updateTrail(dt)
    this.renderer.render(this.scene, this.camera)
  }

  resize() {
    if (!this.renderer || !this.camera || !this.container) return

    const w = this.container.clientWidth
    const h = this.container.clientHeight

    this.renderer.setSize(w, h, false)
    this.camera.left = -w / 2
    this.camera.right = w / 2
    this.camera.top = h / 2
    this.camera.bottom = -h / 2
    this.camera.updateProjectionMatrix()
    this.applyFishScale()
  }

  destroy() {
    this.disposed = true

    this.trailParticles.forEach((p) => {
      p.mesh.geometry.dispose()
      ;(p.mesh.material as THREE.Material).dispose()
    })
    this.trailParticles = []

    if (this.renderer) {
      this.renderer.dispose()
      if (this.renderer.domElement.parentElement) {
        this.renderer.domElement.parentElement.removeChild(this.renderer.domElement)
      }
    }

    const disposeMesh = (mesh: THREE.Mesh | null) => {
      if (!mesh) return
      mesh.geometry.dispose()
    }

    disposeMesh(this.body)
    disposeMesh(this.head)
    disposeMesh(this.tailFinTop)
    disposeMesh(this.tailFinBottom)
    disposeMesh(this.leftFin)
    disposeMesh(this.rightFin)
    disposeMesh(this.dorsalFin)

    this.bodyMaterial?.dispose()
    this.finMaterial?.dispose()
    this.eyeMaterial?.dispose()
    this.trailMaterial?.dispose()

    this.scene = null
    this.camera = null
    this.renderer = null
    this.fishGroup = null
    this.container = null
  }
}
