import { useState } from 'react'

// Busca de lugares pelo Nominatim (OpenStreetMap). A política de uso pede no
// máximo 1 requisição por segundo, por isso a busca só roda ao enviar o
// formulário, e não a cada tecla.
const NOMINATIM = 'https://nominatim.openstreetmap.org/search'

async function buscarLugares(termo) {
  const params = new URLSearchParams({
    q: termo,
    format: 'jsonv2',
    limit: '5',
    'accept-language': 'pt-BR',
  })
  const resposta = await fetch(`${NOMINATIM}?${params}`)
  if (!resposta.ok) throw new Error(`Nominatim respondeu ${resposta.status}`)
  const dados = await resposta.json()

  return dados.map((lugar) => ({
    id: lugar.place_id,
    nome: lugar.name || lugar.display_name.split(',')[0],
    descricao: lugar.display_name,
    lat: Number(lugar.lat),
    lng: Number(lugar.lon),
    limites: [
      [Number(lugar.boundingbox[0]), Number(lugar.boundingbox[2])],
      [Number(lugar.boundingbox[1]), Number(lugar.boundingbox[3])],
    ],
  }))
}

export default function BuscaLugar({ onSelecionar }) {
  const [termo, setTermo] = useState('')
  const [resultados, setResultados] = useState(null)
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState(false)

  async function enviar(e) {
    e.preventDefault()
    const texto = termo.trim()
    if (!texto || carregando) return

    setCarregando(true)
    setErro(false)
    try {
      setResultados(await buscarLugares(texto))
    } catch {
      setErro(true)
      setResultados(null)
    } finally {
      setCarregando(false)
    }
  }

  function selecionar(lugar) {
    setResultados(null)
    setTermo(lugar.nome)
    onSelecionar(lugar)
  }

  function limpar() {
    setTermo('')
    setResultados(null)
    setErro(false)
  }

  return (
    <div className="busca">
      <form className="busca__form" role="search" onSubmit={enviar}>
        <svg viewBox="0 0 24 24" aria-hidden="true" className="busca__icone">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-4-4" />
        </svg>
        <input
          className="busca__campo"
          type="search"
          value={termo}
          onChange={(e) => setTermo(e.target.value)}
          placeholder="Buscar cidade, país ou lugar"
          aria-label="Buscar lugar"
        />
        {termo && (
          <button type="button" className="busca__limpar" onClick={limpar} aria-label="Limpar busca">
            ×
          </button>
        )}
      </form>

      {carregando && <p className="busca__status">Buscando…</p>}
      {erro && <p className="busca__status">Não foi possível buscar agora. Tente de novo.</p>}
      {resultados?.length === 0 && <p className="busca__status">Nenhum lugar encontrado.</p>}

      {resultados?.length > 0 && (
        <ul className="busca__resultados">
          {resultados.map((lugar) => (
            <li key={lugar.id}>
              <button className="busca__resultado" onClick={() => selecionar(lugar)}>
                <span className="busca__resultado-nome">{lugar.nome}</span>
                <span className="busca__resultado-descricao">{lugar.descricao}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
