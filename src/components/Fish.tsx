import './Fish.css'

interface FishProps {
  className?: string
  facingLeft?: boolean
  swimming?: boolean
}

export default function Fish({ className = '', facingLeft = false, swimming = true }: FishProps) {
  return (
    <div
      className={`fish ${facingLeft ? 'fish--left' : ''} ${swimming ? 'fish--swimming' : ''} ${className}`}
      aria-hidden="true"
    >
      <svg className="fish__svg" viewBox="0 0 128 52" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g className="fish__rig">
          {/* Cauda — bate mais rápido, propulsão */}
          <g className="fish__tail">
            <path
              d="M4 26 C0 18 0 34 6 26 L14 26 Z"
              fill="#2891b8"
            />
            <path
              d="M8 26 C4 14 4 38 8 26"
              fill="#38a8cf"
            />
            <path
              d="M12 26 L20 20 L20 32 Z"
              fill="#4ab8d8"
            />
          </g>

          {/* Corpo principal — formato de peixe real, afilado na cabeça */}
          <path
            className="fish__body"
            d="M20 26 C22 16 32 10 48 11 C62 12 78 16 88 22 C94 25 98 26 98 26 C98 26 94 27 88 30 C78 36 62 40 48 41 C32 42 22 36 20 26 Z"
            fill="#5ec4e8"
          />
          <path
            d="M20 26 C22 16 32 10 48 11 C62 12 78 16 88 22 C94 25 98 26 98 26 C98 26 94 27 88 30 C78 36 62 40 48 41 C32 42 22 36 20 26 Z"
            stroke="rgba(255,255,255,0.28)"
            strokeWidth="1"
            fill="none"
          />

          {/* Listras laterais */}
          <path
            d="M38 18 C50 17 62 19 72 23"
            stroke="#2a7a9e"
            strokeWidth="2.5"
            strokeLinecap="round"
            opacity="0.55"
          />
          <path
            d="M36 26 C50 25 64 27 76 30"
            stroke="#2a7a9e"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.4"
          />

          {/* Barbatanas */}
          <path
            className="fish__dorsal"
            d="M52 12 C58 6 66 8 70 14 L64 16 C60 13 56 13 52 12 Z"
            fill="#3aa8cc"
          />
          <path
            className="fish__pectoral"
            d="M42 28 C36 34 34 38 38 36 C40 32 42 30 42 28 Z"
            fill="#4ab8d8"
            opacity="0.9"
          />
          <path
            className="fish__anal"
            d="M58 36 C62 40 66 40 64 37 C62 35 60 35 58 36 Z"
            fill="#3aa8cc"
            opacity="0.85"
          />

          {/* Cabeça e olho */}
          <ellipse cx="36" cy="24" rx="10" ry="9" fill="#6ecfef" />
          <circle cx="30" cy="22" r="3.2" fill="#0c3d52" />
          <circle cx="31" cy="21" r="1.1" fill="#ffffff" opacity="0.95" />
          <path
            d="M22 26 L18 25 L18 27 Z"
            fill="#3aa8cc"
          />
        </g>
      </svg>
    </div>
  )
}
