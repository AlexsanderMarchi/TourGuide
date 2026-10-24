import { useEffect, useState, type FormEvent } from 'react'
import Sidebar from '../components/Sidebar'
import type { Usuario } from '../types'
import { api } from '../api'

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
    <div className="app">
      <Sidebar aberta={sidebarAberta} onAlternar={() => setSidebarAberta((a) => !a)} />
      <main className="conteudo usuarios">
        <h1 className="usuarios__titulo">Usuários</h1>

        <form className="usuarios__form" onSubmit={criar}>
          <label className="login__rotulo">
            Login
            <input
              className="login__campo"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              autoComplete="off"
              required
            />
          </label>

          <label className="login__rotulo">
            Senha
            <input
              className="login__campo"
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              autoComplete="new-password"
              required
            />
          </label>

          <button className="login__entrar" type="submit" disabled={enviando}>
            {enviando ? 'Criando...' : 'Criar usuário'}
          </button>
        </form>

        {erro && <p className="login__erro">{erro}</p>}

        {carregando ? (
          <p className="usuarios__vazio">Carregando...</p>
        ) : usuarios.length === 0 ? (
          <p className="usuarios__vazio">Nenhum usuário cadastrado.</p>
        ) : (
          <ul className="usuarios__lista">
            {usuarios.map((usuario) => (
              <li key={usuario.nome} className="usuarios__item">
                <span>{usuario.nome}</span>
                <button className="destino__remover" onClick={() => remover(usuario)}>
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
