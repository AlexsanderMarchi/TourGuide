import type { ReactNode } from 'react'
import clsx from 'clsx'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

type ItemId = 'descubra' | 'planejamentos' | 'viagens' | 'usuarios' | 'conta'

const icones: Record<ItemId, ReactNode> = {
  descubra: (
    <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm4.2 5.8-2.1 6.3-6.3 2.1 2.1-6.3 6.3-2.1Z" />
  ),
  planejamentos: (
    <path d="M7 2v2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2V2h-2v2H9V2H7Zm-2 8h14v10H5V10Z" />
  ),
  viagens: (
    <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5Z" />
  ),
  usuarios: (
    <path d="M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm8 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM9 13c-3.3 0-7 1.7-7 4v3h14v-3c0-2.3-3.7-4-7-4Zm8 0c-.5 0-1 0-1.5.1 1.5 1 2.5 2.3 2.5 3.9v3h5v-3c0-2.2-3.1-4-6-4Z" />
  ),
  conta: (
    <path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0 2c-4.4 0-8 2.2-8 5v3h16v-3c0-2.8-3.6-5-8-5Z" />
  ),
}

const itens: { id: ItemId; rotulo: string; rota?: string }[] = [
  { id: 'descubra', rotulo: 'Descubra novos lugares', rota: '/' },
  { id: 'planejamentos', rotulo: 'Planejamentos' },
  { id: 'viagens', rotulo: 'Minhas viagens' },
  { id: 'usuarios', rotulo: 'Usuários', rota: '/usuarios' },
  { id: 'conta', rotulo: 'Conta', rota: '/conta' },
]

interface SidebarProps {
  aberta: boolean
  onAlternar: () => void
}

export default function Sidebar({ aberta, onAlternar }: SidebarProps) {
  const navigate = useNavigate()
  const sair = useAuthStore((estado) => estado.sair)

  async function handleSair() {
    await sair()
    navigate('/login', { replace: true })
  }

  const classeItem = clsx(
    'flex w-full cursor-pointer items-center gap-3.5 whitespace-nowrap rounded-lg p-3 text-left text-[0.95rem] hover:bg-sidebar-hover',
    !aberta && 'justify-center',
  )
  const classeRotulo = clsx(!aberta && 'hidden')

  return (
    <aside
      className={clsx(
        'flex shrink-0 flex-col overflow-hidden bg-sidebar text-texto-sidebar transition-[width] duration-200 ease-in-out',
        aberta ? 'w-65' : 'w-18',
      )}
    >
      <div
        className={clsx(
          'flex items-center justify-between gap-2 px-4 py-5',
          !aberta && 'flex-col',
        )}
      >
        <span className="whitespace-nowrap text-xl font-bold">{aberta ? 'TourGuide' : 'TG'}</span>
        <button
          className="grid size-9 shrink-0 cursor-pointer place-items-center rounded-lg bg-sidebar-hover text-texto-sidebar"
          onClick={onAlternar}
          aria-label={aberta ? 'Fechar menu' : 'Abrir menu'}
          aria-expanded={aberta}
        >
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="size-5 fill-none stroke-current stroke-2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d={aberta ? 'M15 6l-6 6 6 6' : 'M9 6l6 6-6 6'} />
          </svg>
        </button>
      </div>

      <nav>
        <ul className="flex flex-col gap-1 px-3 py-2">
          {itens.map((item) => (
            <li key={item.id}>
              <button
                className={classeItem}
                title={aberta ? undefined : item.rotulo}
                onClick={item.rota ? () => navigate(item.rota!) : undefined}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5.5 shrink-0 fill-destaque">
                  {icones[item.id]}
                </svg>
                <span className={classeRotulo}>{item.rotulo}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* fica colado no fim da sidebar (que é flex column) */}
      <div className="mt-auto border-t border-sidebar-hover p-3">
        <button
          className={classeItem}
          title={aberta ? undefined : 'Sair'}
          onClick={handleSair}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5.5 shrink-0 fill-pino">
            <path d="M5 3h8v2H5v14h8v2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Zm11 4 5 5-5 5-1.4-1.4 2.6-2.6H9v-2h8.2l-2.6-2.6L16 7Z" />
          </svg>
          <span className={classeRotulo}>Sair</span>
        </button>
      </div>
    </aside>
  )
}
