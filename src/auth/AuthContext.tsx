import { createContext, useContext, useState, type ReactNode } from 'react'
import { token } from '../api'

interface Auth {
  logado: boolean
  entrar: (novoToken: string) => void
  sair: () => void
}

const AuthContext = createContext<Auth | null>(null)

// O token fica no sessionStorage, então sobrevive ao F5 mas some ao fechar a aba.
export function AuthProvider({ children }: { children: ReactNode }) {
  const [logado, setLogado] = useState(() => token.ler() !== null)

  const valor: Auth = {
    logado,
    entrar: (novoToken) => {
      token.salvar(novoToken)
      setLogado(true)
    },
    sair: () => {
      token.apagar()
      setLogado(false)
    },
  }

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const auth = useContext(AuthContext)
  if (!auth) throw new Error('useAuth precisa estar dentro de <AuthProvider>')
  return auth
}
