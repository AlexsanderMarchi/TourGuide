import { useEffect, useState } from 'react'
import { MapContainer, Popup, TileLayer, ZoomControl, useMap } from 'react-leaflet'
import type { Map as LeafletMap } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import BuscaLugar from './BuscaLugar'
import MarcadorDestinos from './MarcadorDestinos'
import useDestinos from '../hooks/useDestinos'
import type { Lugar } from '../types'

// O Leaflet calcula o tamanho do mapa uma vez; quando a sidebar abre ou fecha,
// a área muda e é preciso avisá-lo depois da transição.
function AjustarTamanho({ gatilho }: { gatilho: unknown }) {
  const map = useMap()

  useEffect(() => {
    const timer = setTimeout(() => map.invalidateSize(), 250)
    return () => clearTimeout(timer)
  }, [gatilho, map])

  return null
}

interface WorldMapProps {
  sidebarAberta: boolean
}

export default function WorldMap({ sidebarAberta }: WorldMapProps) {
  const { destinos, adicionar, renomear, remover } = useDestinos()
  const [map, setMap] = useState<LeafletMap | null>(null)
  const [lugarBuscado, setLugarBuscado] = useState<Lugar | null>(null)

  function irParaLugar(lugar: Lugar) {
    setLugarBuscado(lugar)
    map?.flyToBounds(lugar.limites, { maxZoom: 12, duration: 1.5 })
  }

  function marcarLugarBuscado() {
    if (!lugarBuscado) return
    adicionar(lugarBuscado.lat, lugarBuscado.lng, lugarBuscado.nome)
    setLugarBuscado(null)
  }

  return (
    <div className="mapa-wrapper">
      <MapContainer
        ref={setMap}
        className="mapa"
        center={[20, 0]}
        zoom={2}
        minZoom={2}
        maxBounds={[
          [-90, -180],
          [90, 180],
        ]}
        worldCopyJump
        closePopupOnClick={false}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ZoomControl position="bottomright" />
        <AjustarTamanho gatilho={sidebarAberta} />
        <MarcadorDestinos
          destinos={destinos}
          onAdicionar={adicionar}
          onRenomear={renomear}
          onRemover={remover}
        />

        {lugarBuscado && (
          <Popup
            key={lugarBuscado.id}
            position={[lugarBuscado.lat, lugarBuscado.lng]}
            autoPan={false}
            eventHandlers={{ remove: () => setLugarBuscado(null) }}
          >
            <div className="destino">
              <p className="destino__titulo destino__titulo--busca">Resultado da busca</p>
              <p className="destino__nome-fixo">{lugarBuscado.nome}</p>
              <p className="destino__coordenadas">{lugarBuscado.descricao}</p>
              <button className="destino__marcar" onClick={marcarLugarBuscado}>
                Marcar como quero ir
              </button>
            </div>
          </Popup>
        )}
      </MapContainer>

      <BuscaLugar onSelecionar={irParaLugar} />

      <p className="mapa__dica">
        {destinos.length === 0
          ? 'Clique no mapa ou busque um lugar para marcar onde você quer ir'
          : `${destinos.length} ${destinos.length === 1 ? 'lugar marcado' : 'lugares marcados'}`}
      </p>
    </div>
  )
}
