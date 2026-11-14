import { useState, type InputHTMLAttributes } from 'react'
import clsx from 'clsx'
import { classeCampo } from '../../../shared/estilos'

type CampoSenhaProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>

// Input de senha com o "olhinho": cada clique alterna entre mostrar e esconder
export default function CampoSenha({ className, ...props }: CampoSenhaProps) {
  const [visivel, setVisivel] = useState(false)

  return (
    <div className="relative flex">
      <input
        {...props}
        className={clsx(classeCampo(), 'min-w-0 flex-1 pr-11', className)}
        type={visivel ? 'text' : 'password'}
      />
      <button
        className="absolute right-1.5 top-1/2 grid size-8 -translate-y-1/2 cursor-pointer place-items-center rounded-md text-suave hover:bg-linha hover:text-sidebar"
        type="button"
        onClick={() => setVisivel((v) => !v)}
        aria-label={visivel ? 'Esconder senha' : 'Mostrar senha'}
        aria-pressed={visivel}
      >
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          className="size-5 fill-none stroke-current stroke-2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
          <circle cx="12" cy="12" r="3" />
          {/* risco por cima do olho quando a senha está visível (clique esconde) */}
          {visivel && <path d="M3 3l18 18" />}
        </svg>
      </button>
    </div>
  )
}
