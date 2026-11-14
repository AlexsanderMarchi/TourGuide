import clsx from 'clsx'

// Classes Tailwind reaproveitadas entre telas (formulários e botões).

export const rotulo = 'flex flex-col gap-1.5 text-[0.85rem] font-semibold text-tinta'

export function classeCampo({ codigo = false }: { codigo?: boolean } = {}) {
  return clsx(
    'rounded-lg border border-borda px-3 py-2.5 font-normal',
    'focus:border-transparent focus:outline-2 focus:outline-destaque',
    codigo ? 'text-center text-[1.3rem] tracking-[0.4em]' : 'text-[0.95rem]',
  )
}

export const erro = 'text-[0.85rem] text-perigo'

export const botaoEntrar =
  'cursor-pointer rounded-lg bg-destaque p-3 font-semibold text-white hover:brightness-108 disabled:cursor-wait disabled:opacity-70'

export function classeBotao({ secundario = false }: { secundario?: boolean } = {}) {
  return clsx(
    'shrink-0 cursor-pointer rounded-lg px-4 py-2.5 text-[0.9rem] font-semibold',
    'enabled:hover:brightness-108 disabled:cursor-not-allowed disabled:opacity-60',
    secundario ? 'bg-linha text-tinta' : 'bg-destaque text-white',
  )
}

export const botaoRemover =
  'cursor-pointer self-start rounded-md border border-perigo-borda bg-white px-3 py-1.5 text-[0.8rem] text-perigo hover:bg-perigo-fundo'

export const pagina = 'flex min-w-0 max-w-180 flex-1 flex-col gap-5 overflow-y-auto p-8'
