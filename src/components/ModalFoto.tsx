import { useState } from 'react'
import { ConfigProvider, Modal, Upload } from 'antd'
import { api } from '../api'

const TAMANHO_MAXIMO_ARQUIVO = 10 * 1024 * 1024
// a foto é exibida pequena, então reduzimos antes de enviar para não mandar um base64 enorme
const LADO_MAXIMO = 400

type Props = {
  aberto: boolean
  onFechar: () => void
  onSalvar: (fotoBase64: string) => void
}

function lerComoDataUrl(arquivo: File) {
  return new Promise<string>((resolve, reject) => {
    const leitor = new FileReader()
    leitor.onload = () => resolve(leitor.result as string)
    leitor.onerror = () => reject(leitor.error)
    leitor.readAsDataURL(arquivo)
  })
}

async function redimensionar(dataUrl: string) {
  const imagem = new Image()
  imagem.src = dataUrl
  await imagem.decode()
  const escala = Math.min(1, LADO_MAXIMO / Math.max(imagem.width, imagem.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(imagem.width * escala)
  canvas.height = Math.round(imagem.height * escala)
  canvas.getContext('2d')!.drawImage(imagem, 0, 0, canvas.width, canvas.height)
  return canvas.toDataURL('image/jpeg', 0.85)
}

export default function ModalFoto({ aberto, onFechar, onSalvar }: Props) {
  const [preview, setPreview] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState('')

  async function escolherArquivo(arquivo: File) {
    setErro('')
    if (!arquivo.type.startsWith('image/')) {
      setErro('Selecione um arquivo de imagem.')
      return
    }
    if (arquivo.size > TAMANHO_MAXIMO_ARQUIVO) {
      setErro('A imagem deve ter no máximo 15 MB.')
      return
    }
    try {
      setPreview(await redimensionar(await lerComoDataUrl(arquivo)))
    } catch {
      setErro('Não foi possível ler essa imagem.')
    }
  }

  async function salvar() {
    setErro('')
    setEnviando(true)
    try {
      const resposta = await api('/api/usuario/me/foto', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fotoBase64: preview }),
      })
      if (resposta.ok) {
        onSalvar(preview)
      } else {
        setErro('Não foi possível salvar a foto.')
      }
    } catch {
      setErro('Não foi possível conectar ao servidor.')
    } finally {
      setEnviando(false)
    }
  }

  // limpa só depois da animação de fechar, para o conteúdo não sumir enquanto o modal some
  function limpar() {
    setPreview('')
    setErro('')
  }

  return (
    <ConfigProvider theme={{ token: { colorPrimary: '#2bb3a3' } }}>
      <Modal
        title="Alterar foto de perfil"
        open={aberto}
        onOk={salvar}
        onCancel={onFechar}
        afterClose={limpar}
        okText="Salvar foto"
        cancelText="Cancelar"
        okButtonProps={{ disabled: !preview }}
        cancelButtonProps={{ disabled: enviando }}
        confirmLoading={enviando}
        maskClosable={!enviando}
        keyboard={!enviando}
        closable={!enviando}
        centered
      >
        <Upload.Dragger
          accept="image/*"
          showUploadList={false}
          disabled={enviando}
          // o envio é feito por nós em salvar(); aqui só capturamos o arquivo
          beforeUpload={(arquivo) => {
            escolherArquivo(arquivo)
            return false
          }}
        >
          <div className="modal-foto__conteudo">
            {preview ? (
              <img className="modal-foto__preview" src={preview} alt="Pré-visualização da nova foto" />
            ) : (
              <svg className="modal-foto__icone" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 16V4M7 9l5-5 5 5M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" />
              </svg>
            )}
            <p>
              <strong>Arraste uma imagem aqui</strong> ou clique para selecionar
            </p>
          </div>
        </Upload.Dragger>

        {erro && <p className="login__erro modal-foto__erro">{erro}</p>}
      </Modal>
    </ConfigProvider>
  )
}
