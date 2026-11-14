import { useEffect, useState, type FormEvent } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import CampoSenha from './components/CampoSenha'
import ModalFoto from './components/ModalFoto'
import Sidebar from '../../shared/Sidebar'
import { api } from '../../api'
import { useAuthStore } from '../../store/authStore'
import clsx from 'clsx'
import { classeBotao, classeCampo, erro as classeErro, pagina, rotulo } from '../../shared/estilos'

const cartao = 'flex rounded-xl bg-white p-6 shadow-cartao'
const opcao = 'flex flex-col gap-4 border-t border-linha pt-4'
const textoEmail = 'text-[0.95rem] text-suave'

type DadosConta = {
  nome: string
  email: string
  fotoPerfil: string | null
  perfil: string
}

type EtapaA2f = 'pergunta' | 'qrcode'

// o front envia a foto como data URL, mas se o backend devolver só o base64 puro, montamos o prefixo
function srcFoto(foto: string) {
  return foto.startsWith('data:') ? foto : `data:image/jpeg;base64,${foto}`
}

export default function Conta() {
  const [sidebarAberta, setSidebarAberta] = useState(true)
  const [conta, setConta] = useState<DadosConta | null>(null)
  const [contaErro, setContaErro] = useState('')
  const [alterandoFoto, setAlterandoFoto] = useState(false)

  useEffect(() => {
    let cancelado = false
    async function carregarConta() {
      try {
        const resposta = await api('/api/usuario/me')
        if (cancelado) return
        if (resposta.ok) {
          setConta(await resposta.json())
        } else {
          setContaErro('Não foi possível carregar os dados da conta.')
        }
      } catch {
        if (!cancelado) setContaErro('Não foi possível conectar ao servidor.')
      }
    }
    carregarConta()
    return () => {
      cancelado = true
    }
  }, [])
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

  const iniciais = (conta?.nome ?? '')
    .split(' ')
    .filter(Boolean)
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
    <div className="flex h-full">
      <Sidebar aberta={sidebarAberta} onAlternar={() => setSidebarAberta((a) => !a)} />
      <main className={pagina}>
        <h1 className="text-2xl font-bold text-sidebar">Conta</h1>

        <section className={clsx(cartao, 'flex-row items-center gap-5')}>
          <button
            className="group relative grid size-20 shrink-0 cursor-pointer place-items-center overflow-hidden rounded-full bg-sidebar text-[1.6rem] font-bold text-texto-sidebar disabled:cursor-default"
            type="button"
            onClick={() => setAlterandoFoto(true)}
            disabled={!conta}
            aria-label="Alterar foto de perfil"
          >
            {conta?.fotoPerfil ? (
              <img className="size-full object-cover" src={srcFoto(conta.fotoPerfil)} alt={`Foto de ${conta.nome}`} />
            ) : (
              <span aria-hidden="true">{iniciais}</span>
            )}
            <span
              className="absolute inset-0 grid place-items-center bg-black/50 opacity-0 transition-opacity duration-200 group-focus-visible:opacity-100 group-enabled:group-hover:opacity-100"
              aria-hidden="true"
            >
              <svg
                viewBox="0 0 24 24"
                className="size-7 fill-none stroke-white stroke-[1.8]"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 8a2 2 0 0 1 2-2h2l1.5-2h5L16 6h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" />
                <circle cx="12" cy="12.5" r="3.5" />
              </svg>
            </span>
          </button>
          <ModalFoto
            aberto={alterandoFoto}
            onFechar={() => setAlterandoFoto(false)}
            onSalvar={(fotoPerfil) => {
              setConta((atual) => (atual ? { ...atual, fotoPerfil } : atual))
              setAlterandoFoto(false)
            }}
          />
          <div>
            {conta ? (
              <>
                <p className="flex flex-wrap items-center gap-2 text-[1.2rem] font-bold text-tinta">
                  {conta.nome}
                  {conta.perfil === 'ADMIN' && <span className="rounded-full bg-destaque/15 px-2 py-0.5 text-[0.7rem] font-bold uppercase tracking-[0.05em] text-destaque-escuro">Admin</span>}
                </p>
                <p className={textoEmail}>{conta.email}</p>
              </>
            ) : contaErro ? (
              <p className={classeErro}>{contaErro}</p>
            ) : (
              <p className={textoEmail}>Carregando...</p>
            )}
          </div>
        </section>

        <section className={clsx(cartao, 'flex-col gap-4')}>
          <h2 className="text-[1.1rem] font-bold text-sidebar">Configurações da conta</h2>

          <div className={opcao}>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-tinta">Senha</p>
                <p className="text-[0.85rem] text-suave">Altere a senha usada para entrar no TourGuide.</p>
              </div>
              {!alterandoSenha && (
                <button
                  className={classeBotao({ secundario: true })}
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
              <form className="flex flex-col gap-4" onSubmit={alterarSenha}>
                <label className={rotulo}>
                  Senha atual
                  <CampoSenha
                    value={senhaAtual}
                    onChange={(e) => setSenhaAtual(e.target.value)}
                    autoComplete="current-password"
                    autoFocus
                  />
                </label>

                <label className={rotulo}>
                  Nova senha
                  <CampoSenha
                    value={novaSenha}
                    onChange={(e) => setNovaSenha(e.target.value)}
                    autoComplete="new-password"
                  />
                </label>

                <label className={rotulo}>
                  Confirmar nova senha
                  <CampoSenha
                    value={novaSenhaConfirmacao}
                    onChange={(e) => setNovaSenhaConfirmacao(e.target.value)}
                    autoComplete="new-password"
                  />
                </label>

                {senhaErro && <p className={classeErro}>{senhaErro}</p>}

                <div className="flex flex-wrap gap-3">
                  <button
                    className={classeBotao()}
                    type="submit"
                    disabled={alterandoEnvio || !senhaAtual || !novaSenha || !novaSenhaConfirmacao}
                  >
                    {alterandoEnvio ? 'Salvando...' : 'Salvar nova senha'}
                  </button>
                  <button
                    className={classeBotao({ secundario: true })}
                    type="button"
                    onClick={fecharAlterarSenha}
                    disabled={alterandoEnvio}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            )}

            {senhaSucesso && <p className="text-[0.85rem] text-sucesso">{senhaSucesso}</p>}
          </div>

          <div className={opcao}>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-tinta">Autenticação de dois fatores</p>
                <p className="text-[0.85rem] text-suave">
                  {a2fAtiva
                    ? 'Ao entrar, será pedido o código do seu app autenticador.'
                    : 'Deseja ativar a autenticação de dois fatores? Ao entrar, além da senha, será pedido um código do app autenticador.'}
                </p>
              </div>
              {a2fAtiva ? (
                <span className="inline-flex shrink-0 items-center gap-1.5 text-[0.9rem] font-semibold text-sucesso">
                  <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    className="size-5.5 rounded-full bg-sucesso fill-none stroke-white stroke-3 p-0.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12.5l4.5 4.5L19 7.5" />
                  </svg>
                  Ativada
                </span>
              ) : (
                etapa === 'pergunta' && (
                  <button
                    className={classeBotao()}
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
              <form className="flex flex-col gap-4" onSubmit={ativarA2f}>
                <ol className="list-decimal pl-5 text-[0.9rem] text-tinta">
                  <li>Leia o QR code com um app autenticador (Google Authenticator, Authy etc.).</li>
                  <li>Digite o código de 6 dígitos que aparecer no app.</li>
                </ol>

                <div className="self-center rounded-xl border border-linha bg-white p-3 leading-0">
                  <QRCodeSVG value={urlQrCode} size={180} />
                </div>

                <label className={rotulo}>
                  Código
                  <input
                    className={classeCampo({ codigo: true })}
                    value={codigo}
                    onChange={(e) => setCodigo(e.target.value)}
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    autoFocus
                  />
                </label>

                <div className="flex flex-wrap gap-3">
                  <button className={classeBotao()} type="submit" disabled={enviando || !codigo.trim()}>
                    {enviando ? 'Ativando...' : 'Ativar autenticação de dois fatores'}
                  </button>
                  <button
                    className={classeBotao({ secundario: true })}
                    type="button"
                    onClick={cancelar}
                    disabled={enviando}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            )}

            {erro && <p className={classeErro}>{erro}</p>}
          </div>
        </section>
      </main>
    </div>
  )
}
