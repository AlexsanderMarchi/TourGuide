import clsx from 'clsx'

// Classes dos popups do mapa (destino marcado e resultado da busca).
// Os <p> usam m-0 porque o CSS do Leaflet coloca margem nos parágrafos do popup.

export const popupDestino = 'flex min-w-50 flex-col gap-2 font-sans'

export function classeTituloPopup({ busca = false }: { busca?: boolean } = {}) {
  return clsx(
    'm-0 text-xs font-bold uppercase tracking-[0.08em]',
    busca ? 'text-destaque' : 'text-pino',
  )
}

export const detalhePopup = 'm-0 text-xs text-suave'
