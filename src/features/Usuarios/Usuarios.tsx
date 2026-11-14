import { useEffect, useState, type FormEvent } from 'react'
import Sidebar from '../../shared/Sidebar'
import type { Usuario } from '../../types'
import { api } from '../../api'
import clsx from 'clsx'
import {
  botaoEntrar,
  botaoRemover,
  classeCampo,
  erro as classeErro,
  pagina,
  rotulo,
} from '../../shared/estilos'

export default function Usuarios() {
  const [sidebarAberta, setSidebarAberta] = useState(true)
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [carregando, setCarregando] = useState(true)
  const [login, setLogin] = useState('')
  const [senha, setSenha] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState('')

  async function carregar() {
    setCarregando(true)
    try {
      const resposta = await api('/api/usuario/lista')
      if (resposta.ok) {
        setUsuarios(await resposta.json())
      } else {
        setErro('Não foi possível carregar os usuários.')
      }
    } catch {
      setErro('Não foi possível conectar ao servidor.')
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => {
    carregar()
  }, [])

  async function criar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    setErro('')
    setEnviando(true)
    try {
      const resposta = await api('/api/usuario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login, senha }),
      })
      if (resposta.ok) {
        setLogin('')
        setSenha('')
        await carregar()
      } else {
        setErro('Não foi possível criar o usuário.')
      }
    } catch {
      setErro('Não foi possível conectar ao servidor.')
    } finally {
      setEnviando(false)
    }
  }

  async function remover(usuario: Usuario) {
    if (!confirm(`Excluir o usuário "${usuario.nome}"?`)) return
    setErro('')
    try {
      const resposta = await api(`/api/usuario/${usuario.id}`, { method: 'DELETE' })
      if (resposta.ok) {
        setUsuarios((atuais) => atuais.filter((u) => u.id !== usuario.id))
      } else {
        setErro('Não foi possível excluir o usuário.')
      }
    } catch {
      setErro('Não foi possível conectar ao servidor.')
    }
  }

  return (
    <div className="flex h-full">
      <Sidebar aberta={sidebarAberta} onAlternar={() => setSidebarAberta((a) => !a)} />
      <main className={pagina}>
        <h1 className="text-2xl font-bold text-sidebar">Usuários</h1>

        <form className="flex flex-wrap items-end gap-3 rounded-xl bg-white p-5 shadow-cartao" onSubmit={criar}>
          <label className={clsx(rotulo, 'min-w-40 flex-1')}>
            Login
            <input
              className={classeCampo()}
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              autoComplete="off"
              required
            />
          </label>

          <label className={clsx(rotulo, 'min-w-40 flex-1')}>
            Senha
            <input
              className={classeCampo()}
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              autoComplete="new-password"
              required
            />
          </label>

          <button className={botaoEntrar} type="submit" disabled={enviando}>
            {enviando ? 'Criando...' : 'Criar usuário'}
          </button>
        </form>

        {erro && <p className={classeErro}>{erro}</p>}

        {carregando ? (
          <p className="text-[0.9rem] text-suave">Carregando...</p>
        ) : usuarios.length === 0 ? (
          <p className="text-[0.9rem] text-suave">Nenhum usuário cadastrado.</p>
        ) : (
          <ul className="overflow-hidden rounded-xl bg-white shadow-cartao">
            {usuarios.map((usuario) => (
              <li key={usuario.nome} className="flex items-center justify-between gap-3 border-b border-linha px-5 py-3 text-[0.95rem] text-tinta last:border-b-0">
                <span>{usuario.nome}</span>
                <button className={botaoRemover} onClick={() => remover(usuario)}>
                  Excluir
                </button>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  )
}
