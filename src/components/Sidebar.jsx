const icones = {
  descubra: (
    <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm4.2 5.8-2.1 6.3-6.3 2.1 2.1-6.3 6.3-2.1Z" />
  ),
  planejamentos: (
    <path d="M7 2v2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2V2h-2v2H9V2H7Zm-2 8h14v10H5V10Z" />
  ),
  viagens: (
    <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5Z" />
  ),
  conta: (
    <path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0 2c-4.4 0-8 2.2-8 5v3h16v-3c0-2.8-3.6-5-8-5Z" />
  ),
}

const itens = [
  { id: 'descubra', rotulo: 'Descubra novos lugares' },
  { id: 'planejamentos', rotulo: 'Planejamentos' },
  { id: 'viagens', rotulo: 'Minhas viagens' },
  { id: 'conta', rotulo: 'Conta' },
]

export default function Sidebar({ aberta, onAlternar }) {
  return (
    <aside className={`sidebar${aberta ? '' : ' sidebar--fechada'}`}>
      <div className="sidebar__topo">
        <span className="sidebar__logo">{aberta ? 'TourGuide' : 'TG'}</span>
        <button
          className="sidebar__alternar"
          onClick={onAlternar}
          aria-label={aberta ? 'Fechar menu' : 'Abrir menu'}
          aria-expanded={aberta}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d={aberta ? 'M15 6l-6 6 6 6' : 'M9 6l6 6-6 6'} />
          </svg>
        </button>
      </div>

      <nav>
        <ul className="sidebar__lista">
          {itens.map((item) => (
            <li key={item.id}>
              <button className="sidebar__item" title={aberta ? undefined : item.rotulo}>
                <svg viewBox="0 0 24 24" aria-hidden="true" className="sidebar__icone">
                  {icones[item.id]}
                </svg>
                <span className="sidebar__rotulo">{item.rotulo}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}
