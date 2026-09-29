import { useEffect, useState } from 'react'

const CHAVE = 'tourguide:destinos'

function carregar() {
  try {
    return JSON.parse(localStorage.getItem(CHAVE)) ?? []
  } catch {
    return []
  }
}

// Lugares que o usuário quer visitar, salvos no navegador.
export default function useDestinos() {
  const [destinos, setDestinos] = useState(carregar)

  useEffect(() => {
    try {
      localStorage.setItem(CHAVE, JSON.stringify(destinos))
    } catch {
      // Sem armazenamento disponível (ex.: aba anônima): mantém só em memória.
    }
  }, [destinos])

  function adicionar(lat, lng, nome = '') {
    const novo = { id: crypto.randomUUID(), lat, lng, nome }
    setDestinos((atuais) => [...atuais, novo])
    return novo.id
  }

  function renomear(id, nome) {
    setDestinos((atuais) => atuais.map((d) => (d.id === id ? { ...d, nome } : d)))
  }

  function remover(id) {
    setDestinos((atuais) => atuais.filter((d) => d.id !== id))
  }

  return { destinos, adicionar, renomear, remover }
}
