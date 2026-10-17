import { createContext, useContext, useState, type ReactNode } from 'react'

interface Auth {
  logado: boolean
  entrar: () => void
  sair: () => void
}

const AuthContext = createContext<Auth | null>(null)

// A sessão em si fica no cookie que o backend define; aqui só guardamos se o login deu certo.
export function AuthProvider({ children }: { children: ReactNode }) {
  const [logado, setLogado] = useState(false)

  const valor: Auth = {
    logado,
    entrar: () => setLogado(true),
    sair: () => setLogado(false),
  }

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const auth = useContext(AuthContext)
  if (!auth) throw new Error('useAuth precisa estar dentro de <AuthProvider>')
  return auth
}
