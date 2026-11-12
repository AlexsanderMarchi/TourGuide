import { useState, type FormEvent } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import CampoSenha from '../components/CampoSenha'
import Sidebar from '../components/Sidebar'
import { api } from '../api'
import { useAuthStore } from '../store/authStore'

// TODO: trocar pelos dados reais quando existir a rota com os dados da conta
const contaTemplate = {
  nome: 'Nome do usuário',
  email: 'usuario@email.com',
  foto: null as string | null,
}

type EtapaA2f = 'pergunta' | 'qrcode'

export default function Conta() {
  const [sidebarAberta, setSidebarAberta] = useState(true)
  const a2fAtiva = useAuthStore((estado) => estado.a2fAtiva)
  const marcarA2fAtiva = useAuthStore((estado) => estado.marcarA2fAtiva)

  const [etapa, setEtapa] = useState<EtapaA2f>('pergunta')
  const [urlQrCode, setUrlQrCode] = useState('')
  const [codigo, setCodigo] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState('')

  const [alterandoSenha, setAlterandoSenha] = useState(false)
  const [senhaAtual, setSenhaAtual] = useState('')
  const [novaSenha, setNovaSenha] = useState('')
  const [novaSenhaConfirmacao, setNovaSenhaConfirmacao] = useState('')
  const [alterandoEnvio, setAlterandoEnvio] = useState(false)
  const [senhaErro, setSenhaErro] = useState('')
  const [senhaSucesso, setSenhaSucesso] = useState('')

  const iniciais = contaTemplate.nome
    .split(' ')
    .slice(0, 2)
    .map((parte) => parte[0])
    .join('')
    .toUpperCase()

  // Etapa 1: o servidor gera o secret e devolve a URL otpauth://, que vira o QR code aqui no front
  async function configurarA2f() {
    setErro('')
    setEnviando(true)
    try {
      const resposta = await api('/api/usuario/configurar-a2f', { method: 'PATCH' })
      if (resposta.ok) {
        setUrlQrCode(await resposta.text())
        setEtapa('qrcode')
      } else {
        setErro('Não foi possível gerar o QR code.')
      }
    } catch {
      setErro('Não foi possível conectar ao servidor.')
    } finally {
      setEnviando(false)
    }
  }

  // Etapa 2: confirma o código do app autenticador; só aí o A2F fica ativo
  async function ativarA2f(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    setErro('')
    setEnviando(true)
    try {
      const parametros = new URLSearchParams({ codigo: codigo.trim() })
      const resposta = await api(`/api/usuario/ativar-a2f?${parametros}`, { method: 'PATCH' })
      if (resposta.ok) {
        marcarA2fAtiva()
      } else {
        setErro('Código inválido. Confira o código no app e tente de novo.')
      }
    } catch {
      setErro('Não foi possível conectar ao servidor.')
    } finally {
      setEnviando(false)
    }
  }

  function fecharAlterarSenha() {
    setAlterandoSenha(false)
    setSenhaAtual('')
    setNovaSenha('')
    setNovaSenhaConfirmacao('')
    setSenhaErro('')
  }

  async function alterarSenha(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    setSenhaErro('')
    // o backend também valida, mas assim o usuário não precisa esperar a requisição
    if (novaSenha !== novaSenhaConfirmacao) {
      setSenhaErro('A nova senha e a confirmação não conferem.')
      return
    }
    setAlterandoEnvio(true)
    try {
      const resposta = await api('/api/usuario/alterar-senha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senhaAtual, novaSenha, novaSenhaConfirmacao }),
      })
      if (resposta.ok) {
        fecharAlterarSenha()
        setSenhaSucesso('Senha alterada com sucesso.')
      } else if (resposta.status === 400) {
        // regra de negócio (ex.: senha atual errada) vem como texto no corpo
        const mensagem = await resposta.text()
        setSenhaErro(
          mensagem && !mensagem.startsWith('[') ? mensagem : 'Preencha todos os campos corretamente.',
        )
      } else {
        setSenhaErro('Não foi possível alterar a senha.')
      }
    } catch {
      setSenhaErro('Não foi possível conectar ao servidor.')
    } finally {
      setAlterandoEnvio(false)
    }
  }

  function cancelar() {
    setEtapa('pergunta')
    setUrlQrCode('')
    setCodigo('')
    setErro('')
  }

  return (
    <div className="app">
      <Sidebar aberta={sidebarAberta} onAlternar={() => setSidebarAberta((a) => !a)} />
      <main className="conteudo conta">
        <h1 className="conta__titulo">Conta</h1>

        <section className="conta__cartao conta__perfil">
          <div className="conta__foto">
            {contaTemplate.foto ? (
              <img src={contaTemplate.foto} alt={`Foto de ${contaTemplate.nome}`} />
            ) : (
              <span aria-hidden="true">{iniciais}</span>
            )}
          </div>
          <div>
            <p className="conta__nome">{contaTemplate.nome}</p>
            <p className="conta__email">{contaTemplate.email}</p>
          </div>
        </section>

        <section className="conta__cartao">
          <h2 className="conta__subtitulo">Configurações da conta</h2>

          <div className="conta__opcao conta__opcao--coluna">
            <div className="conta__opcao-linha">
              <div>
                <p className="conta__opcao-titulo">Senha</p>
                <p className="conta__opcao-descricao">Altere a senha usada para entrar no TourGuide.</p>
              </div>
              {!alterandoSenha && (
                <button
                  className="conta__botao conta__botao--secundario"
                  type="button"
                  onClick={() => {
                    setAlterandoSenha(true)
                    setSenhaSucesso('')
                  }}
                >
                  Alterar senha
                </button>
              )}
            </div>

            {alterandoSenha && (
              <form className="conta__a2f" onSubmit={alterarSenha}>
                <label className="login__rotulo">
                  Senha atual
                  <CampoSenha
                    className="login__campo"
                    value={senhaAtual}
                    onChange={(e) => setSenhaAtual(e.target.value)}
                    autoComplete="current-password"
                    autoFocus
                  />
                </label>

                <label className="login__rotulo">
                  Nova senha
                  <CampoSenha
                    className="login__campo"
                    value={novaSenha}
                    onChange={(e) => setNovaSenha(e.target.value)}
                    autoComplete="new-password"
                  />
                </label>

                <label className="login__rotulo">
                  Confirmar nova senha
                  <CampoSenha
                    className="login__campo"
                    value={novaSenhaConfirmacao}
                    onChange={(e) => setNovaSenhaConfirmacao(e.target.value)}
                    autoComplete="new-password"
                  />
                </label>

                {senhaErro && <p className="login__erro">{senhaErro}</p>}

                <div className="conta__acoes">
                  <button
                    className="conta__botao"
                    type="submit"
                    disabled={alterandoEnvio || !senhaAtual || !novaSenha || !novaSenhaConfirmacao}
                  >
                    {alterandoEnvio ? 'Salvando...' : 'Salvar nova senha'}
                  </button>
                  <button
                    className="conta__botao conta__botao--secundario"
                    type="button"
                    onClick={fecharAlterarSenha}
                    disabled={alterandoEnvio}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            )}

            {senhaSucesso && <p className="conta__sucesso">{senhaSucesso}</p>}
          </div>

          <div className="conta__opcao conta__opcao--coluna">
            <div className="conta__opcao-linha">
              <div>
                <p className="conta__opcao-titulo">Autenticação de dois fatores</p>
                <p className="conta__opcao-descricao">
                  {a2fAtiva
                    ? 'Ao entrar, será pedido o código do seu app autenticador.'
                    : 'Deseja ativar a autenticação de dois fatores? Ao entrar, além da senha, será pedido um código do app autenticador.'}
                </p>
              </div>
              {a2fAtiva ? (
                <span className="conta__ativa">
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M5 12.5l4.5 4.5L19 7.5" />
                  </svg>
                  Ativada
                </span>
              ) : (
                etapa === 'pergunta' && (
                  <button
                    className="conta__botao"
                    type="button"
                    onClick={configurarA2f}
                    disabled={enviando}
                  >
                    {enviando ? 'Gerando...' : 'Ativar'}
                  </button>
                )
              )}
            </div>

            {!a2fAtiva && etapa === 'qrcode' && (
              <form className="conta__a2f" onSubmit={ativarA2f}>
                <ol className="conta__passos">
                  <li>Leia o QR code com um app autenticador (Google Authenticator, Authy etc.).</li>
                  <li>Digite o código de 6 dígitos que aparecer no app.</li>
                </ol>

                <div className="conta__qrcode">
                  <QRCodeSVG value={urlQrCode} size={180} />
                </div>

                <label className="login__rotulo">
                  Código
                  <input
                    className="login__campo login__campo--codigo"
                    value={codigo}
                    onChange={(e) => setCodigo(e.target.value)}
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    autoFocus
                  />
                </label>

                <div className="conta__acoes">
                  <button className="conta__botao" type="submit" disabled={enviando || !codigo.trim()}>
                    {enviando ? 'Ativando...' : 'Ativar autenticação de dois fatores'}
                  </button>
                  <button
                    className="conta__botao conta__botao--secundario"
                    type="button"
                    onClick={cancelar}
                    disabled={enviando}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            )}

            {erro && <p className="login__erro">{erro}</p>}
          </div>
        </section>
      </main>
    </div>
  )
}
