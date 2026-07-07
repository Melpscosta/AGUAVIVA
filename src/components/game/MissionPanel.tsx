import type { MissionPhase } from './types'

interface MissionPanelProps {
  phase: MissionPhase
  collected: number
  total: number
}

export default function MissionPanel({ phase, collected, total }: MissionPanelProps) {
  const isComplete = collected >= total

  return (
    <aside className="ocean-mission mission-panel" aria-live="polite">
      <span className="ocean-mission__label">✨ Missão</span>
      {phase === 'collect' ? (
        <>
          <p className="ocean-mission__text">
            Clique nos detritos para ajudar a proteger o oceano.
          </p>
          <span className="ocean-mission__counter">
            {collected}/{total}
          </span>
        </>
      ) : (
        <>
          <p className="ocean-mission__text ocean-mission__text--highlight">
            Mensagem desbloqueada
          </p>
          <p className="ocean-mission__sub">
            Clique na garrafa para ler a mensagem do oceano
          </p>
        </>
      )}
      {isComplete && phase === 'collect' && (
        <span className="ocean-mission__done" aria-hidden="true">
          Completo!
        </span>
      )}
    </aside>
  )
}
