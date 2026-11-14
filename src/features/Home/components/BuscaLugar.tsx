import { useState, type FormEvent } from 'react'
import type { Lugar } from '../../../types'

// Busca de lugares pelo Nominatim (OpenStreetMap). A política de uso pede no
// máximo 1 requisição por segundo, por isso a busca só roda ao enviar o
// formulário, e não a cada tecla.
const NOMINATIM = 'https://nominatim.openstreetmap.org/search'

// Campos usados da resposta do Nominatim.
interface ResultadoNominatim {
  place_id: number
  name: string
  display_name: string
  lat: string
  lon: string
  boundingbox: [string, string, string, string]
}

async function buscarLugares(termo: string): Promise<Lugar[]> {
  const params = new URLSearchParams({
    q: termo,
    format: 'jsonv2',
    limit: '5',
    'accept-language': 'pt-BR',
  })
  const resposta = await fetch(`${NOMINATIM}?${params}`)
  if (!resposta.ok) throw new Error(`Nominatim respondeu ${resposta.status}`)
  const dados: ResultadoNominatim[] = await resposta.json()

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

const classeStatus =
  'mt-2 rounded-[10px] bg-white px-3.5 py-2.5 text-[0.85rem] text-status shadow-flutuante'

interface BuscaLugarProps {
  onSelecionar: (lugar: Lugar) => void
}

export default function BuscaLugar({ onSelecionar }: BuscaLugarProps) {
  const [termo, setTermo] = useState('')
  const [resultados, setResultados] = useState<Lugar[] | null>(null)
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState(false)

  async function enviar(e: FormEvent<HTMLFormElement>) {
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

  function selecionar(lugar: Lugar) {
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
    <div className="absolute left-4 top-4 z-1000 w-[min(360px,calc(100%-32px))] font-sans">
      <form
        className="flex items-center gap-2 rounded-[10px] bg-white px-3 shadow-flutuante focus-within:outline-2 focus-within:outline-destaque"
        role="search"
        onSubmit={enviar}
      >
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          className="size-5 shrink-0 fill-none stroke-suave stroke-2"
          strokeLinecap="round"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-4-4" />
        </svg>
        <input
          className="min-w-0 flex-1 bg-transparent py-3 text-[0.95rem] outline-none [&::-webkit-search-cancel-button]:hidden"
          type="search"
          value={termo}
          onChange={(e) => setTermo(e.target.value)}
          placeholder="Buscar cidade, país ou lugar"
          aria-label="Buscar lugar"
        />
        {termo && (
          <button
            type="button"
            className="cursor-pointer px-1 text-[1.4rem] leading-none text-suave"
            onClick={limpar}
            aria-label="Limpar busca"
          >
            ×
          </button>
        )}
      </form>

      {carregando && <p className={classeStatus}>Buscando…</p>}
      {erro && <p className={classeStatus}>Não foi possível buscar agora. Tente de novo.</p>}
      {resultados?.length === 0 && <p className={classeStatus}>Nenhum lugar encontrado.</p>}

      {resultados && resultados.length > 0 && (
        <ul className="mt-2 overflow-hidden rounded-[10px] bg-white shadow-flutuante">
          {resultados.map((lugar) => (
            <li key={lugar.id} className="border-b border-linha last:border-b-0">
              <button
                className="flex w-full cursor-pointer flex-col gap-0.5 px-3.5 py-2.5 text-left hover:bg-hover-claro"
                onClick={() => selecionar(lugar)}
              >
                <span className="text-[0.95rem] font-semibold text-tinta">{lugar.nome}</span>
                <span className="truncate text-[0.78rem] text-suave">{lugar.descricao}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
