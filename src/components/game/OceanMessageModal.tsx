import { motion, AnimatePresence } from 'framer-motion'
import { createPortal } from 'react-dom'
import type { OceanMessage } from './types'

interface OceanMessageModalProps {
  open: boolean
  message: OceanMessage
  onClose: () => void
}

export default function OceanMessageModal({ open, message, onClose }: OceanMessageModalProps) {
  if (typeof document === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="ocean-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-labelledby="ocean-message-title"
        >
          <motion.article
            className="ocean-modal__card"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <header className="ocean-modal__header">
              <span className="ocean-modal__badge">Mensagem do oceano</span>
              <time className="ocean-modal__date" dateTime={message.date}>
                {new Date(message.date + 'T12:00:00').toLocaleDateString('pt-BR', {
                  day: 'numeric',
                  month: 'long',
                })}
              </time>
            </header>
            <h3 id="ocean-message-title" className="ocean-modal__title">
              {message.title}
            </h3>
            <p className="ocean-modal__summary">{message.summary}</p>
            <footer className="ocean-modal__footer">
              <span className="ocean-modal__source">{message.source}</span>
              {message.link && (
                <a
                  href={message.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ocean-modal__link"
                >
                  Saiba mais
                </a>
              )}
            </footer>
            <button type="button" className="ocean-modal__close" onClick={onClose}>
              Fechar
            </button>
          </motion.article>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}
