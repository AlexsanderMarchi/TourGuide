# TourGuide

Template de um site de viagens em React (Vite): mapa-múndi interativo com uma sidebar à esquerda que abre e fecha.

## Rodando

```bash
npm install
npm run dev
```

Abra http://localhost:5173.

## Estrutura

- `src/components/Sidebar.jsx`: menu lateral (Descubra novos lugares, Planejamentos, Minhas viagens, Conta). As opções ainda não têm lógica.
- `src/components/WorldMap.jsx`: mapa-múndi com [Leaflet](https://leafletjs.com/) e tiles do OpenStreetMap.
- `src/components/MarcadorDestinos.jsx`: clique no mapa para marcar um lugar que quer visitar; o popup do marcador permite dar um nome ou remover.
- `src/components/BuscaLugar.jsx`: campo de busca de lugares usando o [Nominatim](https://nominatim.org/) (OpenStreetMap); o resultado pode ser marcado como "quero ir".
- `src/hooks/useDestinos.js`: guarda os lugares marcados no `localStorage` do navegador.
