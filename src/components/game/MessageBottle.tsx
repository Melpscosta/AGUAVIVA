import { motion } from 'framer-motion'
import Model3D from './Model3D'

const MESSAGE_BOTTLE_SRC = `${import.meta.env.BASE_URL}message_in_a_bottle.glb`

interface MessageBottleProps {
  unlocked: boolean
  onClick: () => void
}

export default function MessageBottle({ unlocked, onClick }: MessageBottleProps) {
  return (
    <motion.button
      type="button"
      className={`ocean-bottle message-bottle${unlocked ? ' is-unlocked' : ' is-locked'}`}
      onClick={onClick}
      disabled={!unlocked}
      animate={{ y: [0, -7, 0, -4, 0] }}
      transition={{ duration: 5.2, repeat: Infinity, ease: 'easeInOut' }}
      whileHover={unlocked ? { scale: 1.06 } : undefined}
      aria-label={unlocked ? 'Abrir mensagem do oceano' : 'Garrafa bloqueada'}
    >
      <span className="ocean-bottle__ripple" aria-hidden="true" />
      {unlocked && <span className="ocean-bottle__shine" aria-hidden="true" />}
      <Model3D
        src={MESSAGE_BOTTLE_SRC}
        className="ocean-bottle__model"
        fit={2.2}
        spinSpeed={unlocked ? 0.28 : 0.12}
        bob={0.07}
        rock={0.1}
        tilt={[0.15, 0, 0.2]}
      />
      {!unlocked && <span className="ocean-bottle__lock" aria-hidden="true" />}
    </motion.button>
  )
}
