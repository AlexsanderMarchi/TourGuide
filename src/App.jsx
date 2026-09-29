import { useState } from 'react'
import Sidebar from './components/Sidebar'
import WorldMap from './components/WorldMap'

export default function App() {
  const [sidebarAberta, setSidebarAberta] = useState(true)

  return (
    <div className="app">
      <Sidebar aberta={sidebarAberta} onAlternar={() => setSidebarAberta((a) => !a)} />
      <main className="conteudo">
        <WorldMap sidebarAberta={sidebarAberta} />
      </main>
    </div>
  )
}
