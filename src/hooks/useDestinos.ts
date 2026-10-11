import { useEffect, useState } from 'react'
import type { Destino } from '../types'

const CHAVE = 'tourguide:destinos'

function carregar(): Destino[] {
  try {
    return JSON.parse(localStorage.getItem(CHAVE) ?? '[]') ?? []
  } catch {
    return []
  }
}

// Lugares que o usuário quer visitar, salvos no navegador.
export default function useDestinos() {
  const [destinos, setDestinos] = useState<Destino[]>(carregar)

  useEffect(() => {
    try {
      localStorage.setItem(CHAVE, JSON.stringify(destinos))
    } catch {
      // Sem armazenamento disponível (ex.: aba anônima): mantém só em memória.
    }
  }, [destinos])

  function adicionar(lat: number, lng: number, nome = ''): string {
    const novo: Destino = { id: crypto.randomUUID(), lat, lng, nome }
    setDestinos((atuais) => [...atuais, novo])
    return novo.id
  }

  function renomear(id: string, nome: string) {
    setDestinos((atuais) => atuais.map((d) => (d.id === id ? { ...d, nome } : d)))
  }

  function remover(id: string) {
    setDestinos((atuais) => atuais.filter((d) => d.id !== id))
  }

  return { destinos, adicionar, renomear, remover }
}
