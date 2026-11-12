import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

interface AuthState {
  logado: boolean
  entrar: () => void
  sair: () => Promise<void>
  // só limpa o estado local (usado quando a API responde 401 e o refresh também falha)
  expirar: () => void
}

// O token NÃO fica aqui: ele está em um cookie HttpOnly que só o servidor lê/escreve.
// O store guarda apenas a flag "logado" para o React saber o que renderizar;
// ela vai para o sessionStorage para sobreviver ao F5 e some ao fechar a aba.
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      logado: false,
      entrar: () => set({ logado: true }),
      sair: async () => {
        try {
          // o JS não consegue apagar cookie HttpOnly, então pede ao servidor
          await fetch('/api/auth/login/logout', { method: 'POST', credentials: 'same-origin' })
        } finally {
          set({ logado: false })
        }
      },
      expirar: () => set({ logado: false }),
    }),
    {
      name: 'auth',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (estado) => ({ logado: estado.logado }),
    },
  ),
)
