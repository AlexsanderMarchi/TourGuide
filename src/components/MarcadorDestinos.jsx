import { useRef, useState } from 'react'
import L from 'leaflet'
import { Marker, Popup, useMapEvents } from 'react-leaflet'

// Pino próprio em vez do ícone padrão do Leaflet, cujas imagens não são
// encontradas pelo Vite sem configuração extra.
const iconeDestino = L.divIcon({
  className: 'pino',
  html: '<svg viewBox="0 0 24 32"><path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 20 12 20s12-11 12-20C24 5.4 18.6 0 12 0Z"/><circle cx="12" cy="12" r="4.5"/></svg>',
  iconSize: [28, 38],
  iconAnchor: [14, 38],
  popupAnchor: [0, -34],
})

export default function MarcadorDestinos({ destinos, onAdicionar, onRenomear, onRemover }) {
  const [recemCriado, setRecemCriado] = useState(null)
  const popupAberto = useRef(false)

  const map = useMapEvents({
    popupopen: () => (popupAberto.current = true),
    popupclose: () => (popupAberto.current = false),
    click(e) {
      // O clique em "Remover" tira o popup da tela e ainda chega ao mapa;
      // sem este teste ele criaria um marcador novo no mesmo lugar.
      if (!map.getContainer().contains(e.originalEvent.target)) return

      // Com um popup aberto, o clique no mapa só o fecha (o MapContainer usa
      // closePopupOnClick={false} para essa decisão ficar aqui).
      if (popupAberto.current) {
        map.closePopup()
        return
      }

      setRecemCriado(onAdicionar(e.latlng.lat, e.latlng.lng))
    },
  })

  return destinos.map((destino) => {
    // Com o mapa repetido nas laterais, a longitude pode passar de ±180.
    const coordenadas = L.latLng(destino.lat, destino.lng).wrap()

    return (
      <Marker
        key={destino.id}
        position={[destino.lat, destino.lng]}
        icon={iconeDestino}
        eventHandlers={{
          add: (e) => {
            if (destino.id === recemCriado) e.target.openPopup()
          },
        }}
      >
        <Popup>
          <div className="destino">
            <p className="destino__titulo">Quero ir</p>
            <input
              className="destino__nome"
              value={destino.nome}
              placeholder="Nome do lugar"
              autoFocus={destino.id === recemCriado}
              onChange={(e) => onRenomear(destino.id, e.target.value)}
            />
            <p className="destino__coordenadas">
              {coordenadas.lat.toFixed(4)}, {coordenadas.lng.toFixed(4)}
            </p>
            <button className="destino__remover" onClick={() => onRemover(destino.id)}>
              Remover
            </button>
          </div>
        </Popup>
      </Marker>
    )
  })
}
