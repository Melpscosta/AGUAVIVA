import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import './Login.css'

interface LoginProps {
  mode?: 'login' | 'signup'
}

function WhaleTail() {
  return (
    <svg className="login__whale" viewBox="0 0 48 32" aria-hidden="true">
      <path
        d="M24 30 C22 20 18 12 6 4 C14 6 20 10 24 16 C28 10 34 6 42 4 C30 12 26 20 24 30 Z"
        fill="none"
        stroke="rgba(255,255,255,0.8)"
        strokeWidth="1.6"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  )
}

export default function Login({ mode = 'login' }: LoginProps) {
  const isSignup = mode === 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    // TODO: conectar autenticação (Firebase) posteriormente
  }

  return (
    <div className="login">
      <div className="login__scene" aria-hidden="true">
        <div className="login__bubbles">
          {Array.from({ length: 18 }).map((_, i) => (
            <span key={i} className={`login__bubble login__bubble--${i % 9}`} />
          ))}
        </div>
      </div>

      <Link to="/" className="login__back">
        <span aria-hidden="true">←</span> Voltar
      </Link>

      <main className="login__card">
        <div className="login__inner">
          <h1 className="login__title">{isSignup ? 'Criar Conta' : 'Login'}</h1>

          <form className="login__form" onSubmit={handleSubmit}>
            {isSignup && (
              <input
                className="login__input"
                type="text"
                placeholder="Nome"
                autoComplete="name"
              />
            )}
            <input
              className="login__input"
              type="email"
              placeholder="E-mail"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              className="login__input"
              type="password"
              placeholder="Senha"
              autoComplete={isSignup ? 'new-password' : 'current-password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <div className="login__actions">
              <button
                type="button"
                className="login__btn login__btn--google"
                aria-label="Entrar com Google"
              >
                <span className="login__google-inner">
                  <span className="login__google-label">
                    Entrar com{' '}
                    <span className="login__google-word" aria-hidden="true">
                      <span className="login__gl login__gl--1">G</span>
                      <span className="login__gl login__gl--2">o</span>
                      <span className="login__gl login__gl--3">o</span>
                      <span className="login__gl login__gl--4">g</span>
                      <span className="login__gl login__gl--5">l</span>
                      <span className="login__gl login__gl--6">e</span>
                    </span>
                  </span>
                </span>
              </button>
              <button type="submit" className="login__btn login__btn--primary">
                {isSignup ? 'Cadastrar' : 'Entrar'}
              </button>
            </div>
          </form>

          {!isSignup && (
            <a href="#recuperar" className="login__forgot">
              Esqueceu a senha?
            </a>
          )}

          <div className="login__divider">
            <span className="login__divider-line" />
            <WhaleTail />
            <span className="login__divider-line" />
          </div>

          <p className="login__switch">
            {isSignup ? (
              <>
                Já possui conta? <Link to="/login">Entrar</Link>
              </>
            ) : (
              <>
                Não possui conta? <Link to="/criar-conta">Criar</Link>
              </>
            )}
          </p>
        </div>
      </main>
    </div>
  )
}
