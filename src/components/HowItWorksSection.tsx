import { useCallback, useEffect, useRef, useState } from 'react'

import { STEPS } from '../config'

import { FishGuide3D } from './FishGuide3D'

import './HowItWorksSection.css'



function clamp(value: number, min: number, max: number) {

  return Math.min(Math.max(value, min), max)

}



function getSectionProgress(section: HTMLElement): number {

  const rect = section.getBoundingClientRect()

  const scrollable = section.offsetHeight - window.innerHeight

  if (scrollable <= 0) return 0

  return clamp(-rect.top / scrollable, 0, 1)

}



const STEP_THRESHOLDS = { 1: 0.14, 2: 0.3, 3: 0.5 } as const



function getActiveStepFromProgress(progress: number): number {

  if (progress >= 0.5) return 3

  if (progress >= 0.3) return 2

  if (progress >= 0.14) return 1

  return 0

}



function getStepClass(

  stepNumber: number,

  activeStep: number,

  progress: number,

  reducedMotion: boolean

) {

  if (reducedMotion) {

    return stepNumber === activeStep && activeStep > 0

      ? 'how-step is-visible is-active'

      : 'how-step'

  }



  const threshold = STEP_THRESHOLDS[stepNumber as 1 | 2 | 3]

  if (activeStep !== stepNumber || progress < threshold - 0.02) {

    return 'how-step'

  }



  return 'how-step is-visible is-active'

}



export default function HowItWorksSection() {

  const sectionRef = useRef<HTMLElement>(null)

  const stickyRef = useRef<HTMLDivElement>(null)

  const canvasRef = useRef<HTMLCanvasElement>(null)

  const fishRef = useRef<FishGuide3D | null>(null)



  const step1Ref = useRef<HTMLElement>(null)

  const step2Ref = useRef<HTMLElement>(null)

  const step3Ref = useRef<HTMLElement>(null)

  const ctaRef = useRef<HTMLButtonElement>(null)

  const stageRef = useRef<HTMLDivElement>(null)



  const stepRefs = [step1Ref, step2Ref, step3Ref]



  const [progress, setProgress] = useState(0)

  const [activeStep, setActiveStep] = useState(0)

  const [ctaHighlight, setCtaHighlight] = useState(false)

  const [reducedMotion, setReducedMotion] = useState(false)



  const progressRef = useRef(0)



  const getAnchors = useCallback(

    () => ({

      step1: step1Ref.current,

      step2: step2Ref.current,

      step3: step3Ref.current,

      cta: ctaRef.current,

      stage: stageRef.current,

    }),

    []

  )



  const updateHowItWorksTimeline = useCallback(

    (value: number) => {

      progressRef.current = value

      setProgress(value)



      const step = getActiveStepFromProgress(value)

      setActiveStep(step)



      const fish = fishRef.current

      if (fish) {

        fish.moveAlongPath(value, getAnchors())

        const state = fish.getGuideState()

        setCtaHighlight(state.ctaHighlight)

      } else {

        setCtaHighlight(value > 0.88)

      }

    },

    [getAnchors]

  )



  useEffect(() => {

    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')

    setReducedMotion(mq.matches)

    const onChange = () => setReducedMotion(mq.matches)

    mq.addEventListener('change', onChange)

    return () => mq.removeEventListener('change', onChange)

  }, [])



  useEffect(() => {

    const sticky = stickyRef.current

    const canvas = canvasRef.current

    if (!sticky || !canvas) return



    const fish = new FishGuide3D()

    fish.init(sticky, canvas)

    fishRef.current = fish



    let raf = 0

    const loop = (time: number) => {

      fish.update(time)

      raf = requestAnimationFrame(loop)

    }

    raf = requestAnimationFrame(loop)



    const onResize = () => {

      fish.resize()

      fish.moveAlongPath(progressRef.current, getAnchors())

    }

    window.addEventListener('resize', onResize)



    requestAnimationFrame(() => {

      fish.moveAlongPath(progressRef.current, getAnchors())

    })



    return () => {

      cancelAnimationFrame(raf)

      window.removeEventListener('resize', onResize)

      fish.destroy()

      fishRef.current = null

    }

  }, [getAnchors])



  useEffect(() => {

    const section = sectionRef.current

    if (!section) return



    let raf = 0

    const onScroll = () => {

      cancelAnimationFrame(raf)

      raf = requestAnimationFrame(() => {

        updateHowItWorksTimeline(getSectionProgress(section))

      })

    }



    onScroll()

    window.addEventListener('scroll', onScroll, { passive: true })

    window.addEventListener('resize', onScroll)



    return () => {

      cancelAnimationFrame(raf)

      window.removeEventListener('scroll', onScroll)

      window.removeEventListener('resize', onScroll)

    }

  }, [updateHowItWorksTimeline])



  const showCta = reducedMotion ? activeStep >= 3 : progress >= 0.68



  return (

    <section

      className="how-section"

      ref={sectionRef}

      id="como-funciona"

      aria-label="Como funciona"

      data-reduced-motion={reducedMotion ? 'true' : 'false'}

    >

      <div className="how-section__ambient" aria-hidden="true">

        <div className="how-section__glow how-section__glow--top" />

        <div className="how-section__glow how-section__glow--bottom" />

        <div className="how-section__bubbles" />

      </div>



      <div className="how-sticky" ref={stickyRef}>

        <canvas ref={canvasRef} className="fish-guide-canvas" aria-hidden="true" />



        <div className="how-content">

          <h2 className="how-title">Como Funciona</h2>



          <div className="how-step-stage" ref={stageRef}>

            <div className="how-steps__trail" aria-hidden="true" />



            {STEPS.map((step, index) => (

              <article

                key={step.number}

                id={`step-${step.number}`}

                ref={stepRefs[index]}

                className={getStepClass(step.number, activeStep, progress, reducedMotion)}

                aria-hidden={activeStep !== step.number}

              >

                <span className="how-step__number" aria-hidden="true">

                  {step.number}

                </span>

                <h3 className="how-step__title">{step.title}</h3>

                <p className="how-step__text">{step.text}</p>

              </article>

            ))}

          </div>



          <div className={`how-cta-wrap${showCta ? ' is-visible' : ''}`}>

            <button

              id="community-cta"

              ref={ctaRef}

              type="button"

              className={`community-cta how-cta${ctaHighlight ? ' how-cta--splash' : ''}`}

              onClick={() => {

                document.getElementById('parcerias')?.scrollIntoView({ behavior: 'smooth' })

              }}

            >

              Faça parte da nossa comunidade

            </button>

          </div>

        </div>

      </div>

    </section>

  )

}


