import { useState } from 'react'
import OceanCleanupGame, { type MissionState } from './game/OceanCleanupGame'
import MissionPanel from './game/MissionPanel'
import './Hero.css'

export default function Hero() {
  const [mission, setMission] = useState<MissionState>({
    phase: 'collect',
    collected: 0,
    total: 3,
  })

  return (
    <section className="hero" id="sobre" aria-label="Apresentação">
      <div className="hero__horizon" aria-hidden="true">
        <img
          className="hero__scene"
          src={`${import.meta.env.BASE_URL}hero-soft-ocean.png`}
          alt=""
          loading="eager"
          decoding="async"
        />
        <div className="hero__foreground" />
      </div>

      <div className="hero__game-placeholder">
        <OceanCleanupGame onMissionChange={setMission} />
      </div>

      <div className="hero__content">
        <h1 className="hero__title">ÁguaViva</h1>
        <p className="hero__tagline">
          uma onda de mudança
          <br />
          na sustentabilidade marinha
        </p>

        <MissionPanel
          phase={mission.phase}
          collected={mission.collected}
          total={mission.total}
        />
      </div>
    </section>
  )
}
