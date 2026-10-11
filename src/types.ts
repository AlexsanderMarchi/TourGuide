import type { LatLngBoundsExpression } from 'leaflet'

export interface Destino {
  id: string
  lat: number
  lng: number
  nome: string
}

export interface Lugar {
  id: number
  nome: string
  descricao: string
  lat: number
  lng: number
  limites: LatLngBoundsExpression
}
