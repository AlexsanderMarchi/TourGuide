import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface AuthState {
  logado: boolean;
  // ainda não existe rota com os dados da conta, então o front deduz pelo login:
  // quem passou pelo verificar-a2f (ou acabou de ativar) tem o A2F ativo
  a2fAtiva: boolean;
  entrar: (a2fAtiva?: boolean) => void;
  marcarA2fAtiva: () => void;
  sair: () => Promise<void>;
  // só limpa o estado local (usado quando a API responde 401 e o refresh também falha)
  expirar: () => void;
}

// O token NÃO fica aqui: ele está em um cookie HttpOnly que só o servidor lê/escreve.
// O store guarda apenas a flag "logado" para o React saber o que renderizar;
// ela vai para o sessionStorage para sobreviver ao F5 e some ao fechar a aba.
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      logado: false,
      a2fAtiva: false,
      entrar: (a2fAtiva = false) => set({ logado: true, a2fAtiva }),
      marcarA2fAtiva: () => set({ a2fAtiva: true }),
      sair: async () => {
        try {
          // o JS não consegue apagar cookie HttpOnly, então pede ao servidor
          await fetch("/api/auth/logout", {
            method: "POST",
            credentials: "same-origin",
          });
        } finally {
          set({ logado: false, a2fAtiva: false });
        }
      },
      expirar: () => set({ logado: false, a2fAtiva: false }),
    }),
    {
      name: "auth",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (estado) => ({ logado: estado.logado, a2fAtiva: estado.a2fAtiva }),
    }
  )
);
