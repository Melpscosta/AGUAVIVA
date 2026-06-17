import { useEffect, useState } from 'react'
import './Navbar.css'

const navLinks = [
  { label: 'Sobre', href: '#como-funciona', watchIds: ['como-funciona'] },
  { label: 'Parcerias', href: '#parcerias', watchIds: ['parcerias'] },
  { label: 'Login', href: '#login', watchIds: ['login'] },
  { label: 'Criar Conta', href: '#criar-conta', watchIds: ['criar-conta'] },
]

const watchedSectionIds = [...new Set(navLinks.flatMap((link) => link.watchIds))]

function JellyfishLogo() {
  return (
    <svg className="navbar__logo" viewBox="0 0 48 48" aria-hidden="true">
      <ellipse cx="24" cy="16" rx="12" ry="9" fill="#f0a0d0" />
      <path d="M14 22 Q24 28 34 22" fill="none" stroke="#c084fc" strokeWidth="1.5" />
      <path d="M19 25 Q21 36 23 42" fill="none" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" />
      <path d="M24 25 Q26 38 28 44" fill="none" stroke="#0ea5e9" strokeWidth="2" strokeLinecap="round" />
      <path d="M29 25 Q31 34 33 40" fill="none" stroke="#0284c7" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function useActiveSection() {
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null)

  useEffect(() => {
    const sections = watchedSectionIds
      .map((id) => document.getElementById(id))
      .filter((section): section is HTMLElement => section !== null)

    if (sections.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)

        if (visible.length > 0) {
          setActiveSectionId(visible[0].target.id)
        }
      },
      {
        rootMargin: '-35% 0px -45% 0px',
        threshold: [0, 0.15, 0.35, 0.55, 0.75, 1],
      }
    )

    sections.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [])

  return activeSectionId
}

export default function Navbar() {
  const activeSectionId = useActiveSection()

  return (
    <header className="navbar">
      <nav className="navbar__inner" aria-label="Navegação principal">
        <a href="#sobre" className="navbar__brand" aria-label="ÁguaViva — início">
          <JellyfishLogo />
        </a>
        <ul className="navbar__links">
          {navLinks.map((link) => {
            const isActive = link.watchIds.includes(activeSectionId ?? '')

            return (
              <li key={link.href}>
                <a href={link.href} className={isActive ? 'is-active' : undefined} aria-current={isActive ? 'page' : undefined}>
                  {link.label}
                </a>
              </li>
            )
          })}
        </ul>
      </nav>
    </header>
  )
}
