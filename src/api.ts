import { useAuthStore } from './store/authStore'

// Se várias requisições tomarem 401 ao mesmo tempo, todas esperam o mesmo refresh.
let refreshEmAndamento: Promise<boolean> | null = null

function atualizarToken() {
  refreshEmAndamento ??= fetch('/api/auth/login/atualizar-token', {
    method: 'POST',
    credentials: 'same-origin',
  })
    .then((resposta) => resposta.ok)
    .catch(() => false)
    .finally(() => {
      refreshEmAndamento = null
    })
  return refreshEmAndamento
}

// fetch para a API: o navegador já envia o cookie HttpOnly com o token (credentials: same-origin).
// Se o access token expirou (401), tenta renovar com o refresh token e repete a requisição uma vez;
// se não der, marca como deslogado e a RotaProtegida manda para o /login.
export async function api(url: string, init: RequestInit = {}) {
  const requisicao = () => fetch(url, { ...init, credentials: 'same-origin' })

  const resposta = await requisicao()
  if (resposta.status !== 401) return resposta

  if (await atualizarToken()) return requisicao()

  useAuthStore.getState().expirar()
  return resposta
}
