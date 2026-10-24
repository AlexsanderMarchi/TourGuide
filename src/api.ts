const CHAVE_TOKEN = 'token'

export const token = {
  ler: () => sessionStorage.getItem(CHAVE_TOKEN),
  salvar: (valor: string) => sessionStorage.setItem(CHAVE_TOKEN, valor),
  apagar: () => sessionStorage.removeItem(CHAVE_TOKEN),
}

// fetch que já envia o token no header Authorization (use em toda chamada à API, menos no login)
export function api(url: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers)
  const atual = token.ler()
  if (atual) headers.set('Authorization', `Bearer ${atual}`)
  return fetch(url, { ...init, headers })
}
