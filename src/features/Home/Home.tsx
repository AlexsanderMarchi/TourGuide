import { useState } from 'react'
import Sidebar from '../../shared/Sidebar'
import WorldMap from './components/WorldMap'

export default function Home() {
  const [sidebarAberta, setSidebarAberta] = useState(true)

  return (
    <div className="flex h-full">
      <Sidebar aberta={sidebarAberta} onAlternar={() => setSidebarAberta((a) => !a)} />
      <main className="min-w-0 flex-1">
        <WorldMap sidebarAberta={sidebarAberta} />
      </main>
    </div>
  )
}
