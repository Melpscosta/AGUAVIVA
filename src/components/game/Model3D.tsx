import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'

interface Model3DProps {
  src: string
  className?: string
  /** target size (world units) of the model's largest dimension */
  fit?: number
  /** continuous Y rotation, radians per second */
  spinSpeed?: number
  /** vertical bob amplitude (world units) */
  bob?: number
  /** side-to-side rocking amplitude (radians) */
  rock?: number
  /** initial rotation applied once, [x, y, z] radians */
  tilt?: [number, number, number]
}

export default function Model3D({
  src,
  className,
  fit = 1.9,
  spinSpeed = 0.3,
  bob = 0.05,
  rock = 0.07,
  tilt = [0, 0, 0],
}: Model3DProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let disposed = false
    let frameId = 0

    const scene = new THREE.Scene()

    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100)
    camera.position.set(0, 0.1, 3.4)

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    })
    renderer.setClearColor(0x000000, 0)
    // Supersample: render above CSS resolution for crisp edges on small canvas
    renderer.setPixelRatio(Math.min(window.devicePixelRatio * 1.5, 3))
    if ('outputEncoding' in renderer) {
      ;(renderer as unknown as { outputEncoding: number }).outputEncoding =
        THREE.sRGBEncoding
    }
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.05
    container.appendChild(renderer.domElement)
    renderer.domElement.style.width = '100%'
    renderer.domElement.style.height = '100%'
    renderer.domElement.style.display = 'block'

    // Image-based lighting for realistic plastic/glass reflections
    const pmrem = new THREE.PMREMGenerator(renderer)
    const envTexture = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
    scene.environment = envTexture

    const ambient = new THREE.AmbientLight(0xffffff, 0.4)
    scene.add(ambient)

    const keyLight = new THREE.DirectionalLight(0xfff0dc, 1.4)
    keyLight.position.set(2.5, 3.5, 3)
    scene.add(keyLight)

    const rimLight = new THREE.DirectionalLight(0xbcd4ff, 0.9)
    rimLight.position.set(-3, 1, -2.5)
    scene.add(rimLight)

    const pivot = new THREE.Group()
    pivot.rotation.set(tilt[0], tilt[1], tilt[2])
    scene.add(pivot)

    const resize = () => {
      const w = container.clientWidth
      const h = container.clientHeight
      if (w === 0 || h === 0) return
      renderer.setSize(w, h, false)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
    }

    const loader = new GLTFLoader()
    loader.load(
      src,
      (gltf: { scene: THREE.Object3D }) => {
        if (disposed) return
        const model = gltf.scene

        const size = new THREE.Vector3()
        new THREE.Box3().setFromObject(model).getSize(size)
        const maxDim = Math.max(size.x, size.y, size.z) || 1
        model.scale.setScalar(fit / maxDim)

        const center = new THREE.Vector3()
        new THREE.Box3().setFromObject(model).getCenter(center)
        model.position.sub(center)

        model.traverse((obj) => {
          const mesh = obj as THREE.Mesh
          if (mesh.isMesh) {
            const mat = mesh.material as THREE.MeshStandardMaterial
            if (mat && 'envMapIntensity' in mat) {
              mat.envMapIntensity = 1.1
              mat.needsUpdate = true
            }
          }
        })

        pivot.add(model)
        setReady(true)
      },
      undefined,
      (err: unknown) => {
        console.error('Falha ao carregar modelo 3D:', err)
      }
    )

    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(container)

    const clock = new THREE.Clock()
    const animate = () => {
      frameId = requestAnimationFrame(animate)
      const dt = Math.min(clock.getDelta(), 0.05)
      const t = clock.getElapsedTime()
      pivot.rotation.y += spinSpeed * dt
      pivot.rotation.z = tilt[2] + Math.sin(t * 0.8) * rock
      pivot.rotation.x = tilt[0] + Math.sin(t * 0.65 + 1.3) * (rock * 0.5)
      pivot.position.y = Math.sin(t * 1.05) * bob
      renderer.render(scene, camera)
    }
    animate()

    return () => {
      disposed = true
      cancelAnimationFrame(frameId)
      ro.disconnect()
      scene.traverse((obj) => {
        const mesh = obj as THREE.Mesh
        if (mesh.geometry) mesh.geometry.dispose()
        const mat = mesh.material as THREE.Material | THREE.Material[] | undefined
        if (Array.isArray(mat)) mat.forEach((m) => m.dispose())
        else if (mat) mat.dispose()
      })
      envTexture.dispose()
      pmrem.dispose()
      renderer.dispose()
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src, fit, spinSpeed, bob, rock, tilt[0], tilt[1], tilt[2]])

  return (
    <div
      ref={containerRef}
      className={className}
      data-ready={ready}
      aria-hidden="true"
    />
  )
}
