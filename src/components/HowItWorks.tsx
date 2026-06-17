import { useRef, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { STEPS } from '../config'
import FishGuide from './FishGuide'
import './HowItWorks.css'

function SplashEffect({ show }: { show: boolean }) {
  if (!show) return null

  return (
    <div className="splash" aria-hidden="true">
      {[...Array(8)].map((_, i) => (
        <motion.span
          key={i}
          className="splash__drop"
          initial={{ scale: 0, opacity: 1 }}
          animate={{
            scale: [0, 1.5],
            opacity: [1, 0],
            x: Math.cos((i / 8) * Math.PI * 2) * 40,
            y: Math.sin((i / 8) * Math.PI * 2) * 40,
          }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        />
      ))}
      <motion.span
        className="splash__ring"
        initial={{ scale: 0.3, opacity: 0.8 }}
        animate={{ scale: 2.5, opacity: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      />
    </div>
  )
}

export default function HowItWorks() {
  const sectionRef = useRef<HTMLElement>(null)
  const anchorRefs = useRef<(HTMLElement | null)[]>([])
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [activeStep, setActiveStep] = useState(0)
  const [showSplash, setShowSplash] = useState(false)

  const handleRevealStep = useCallback((step: number) => {
    setActiveStep(step)
  }, [])

  const handleSplash = useCallback(() => setShowSplash(true), [])

  return (
    <section className="how-it-works" ref={sectionRef} id="como-funciona" aria-label="Como funciona">
      <div className="how-it-works__ambient" aria-hidden="true">
        <div className="how-it-works__glow" />
      </div>

      <FishGuide
        sectionRef={sectionRef}
        anchorRefs={anchorRefs}
        buttonRef={buttonRef}
        onRevealStep={handleRevealStep}
        onSplash={handleSplash}
      />

      <div className="how-it-works__container">
        <motion.h2
          className="how-it-works__title"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          Como Funciona
        </motion.h2>

        <ol className="how-it-works__steps">
          {STEPS.map((step, index) => {
            const isActive = activeStep >= step.number

            return (
              <li key={step.number} className="how-it-works__step">
                <motion.article
                  id={`step-${step.number}`}
                  className={`step-item fish-guide-target${isActive ? ' is-active' : ''}`}
                  ref={(el) => {
                    anchorRefs.current[index] = el
                  }}
                  initial={{ opacity: 0.45, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3, margin: '0px 0px -45% 0px' }}
                  onViewportEnter={() => handleRevealStep(step.number)}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                >
                  <span className="step-item__number" aria-hidden="true">
                    {step.number}
                  </span>
                  <h3 className="step-item__title">{step.title}</h3>
                  <p className="step-item__text">{step.text}</p>
                </motion.article>
              </li>
            )
          })}
        </ol>

        <div className="how-it-works__cta-wrapper">
          <button
            id="community-cta"
            className="how-it-works__cta community-cta fish-guide-target"
            ref={buttonRef}
            onClick={() => {
              document.getElementById('parcerias')?.scrollIntoView({ behavior: 'smooth' })
            }}
          >
            Faça parte da nossa comunidade
          </button>
          <SplashEffect show={showSplash} />
        </div>
      </div>
    </section>
  )
}
