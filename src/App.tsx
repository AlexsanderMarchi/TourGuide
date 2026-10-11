import { useState } from 'react'
import Login from './components/Login'
import Sidebar from './components/Sidebar'
import WorldMap from './components/WorldMap'

export default function App() {
  const [logado, setLogado] = useState(false)
  const [sidebarAberta, setSidebarAberta] = useState(true)

  if (!logado) {
    return <Login onEntrar={() => setLogado(true)} />
  }

  return (
    <div className="app">
      <Sidebar aberta={sidebarAberta} onAlternar={() => setSidebarAberta((a) => !a)} />
      <main className="conteudo">
        <WorldMap sidebarAberta={sidebarAberta} />
      </main>
    </div>
  )
}
