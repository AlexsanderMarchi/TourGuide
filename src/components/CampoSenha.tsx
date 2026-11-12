import { useState, type InputHTMLAttributes } from 'react'

type CampoSenhaProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>

// Input de senha com o "olhinho": cada clique alterna entre mostrar e esconder
export default function CampoSenha({ className = '', ...props }: CampoSenhaProps) {
  const [visivel, setVisivel] = useState(false)

  return (
    <div className="campo-senha">
      <input {...props} className={className} type={visivel ? 'text' : 'password'} />
      <button
        className="campo-senha__olho"
        type="button"
        onClick={() => setVisivel((v) => !v)}
        aria-label={visivel ? 'Esconder senha' : 'Mostrar senha'}
        aria-pressed={visivel}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
          <circle cx="12" cy="12" r="3" />
          {/* risco por cima do olho quando a senha está visível (clique esconde) */}
          {visivel && <path d="M3 3l18 18" />}
        </svg>
      </button>
    </div>
  )
}
