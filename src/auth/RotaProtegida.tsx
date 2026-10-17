import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from './AuthContext'

// Manda para /login quem não está logado, lembrando de onde veio.
export default function RotaProtegida() {
  const { logado } = useAuth()
  const location = useLocation()

  if (!logado) {
    return <Navigate to="/login" replace state={{ de: location.pathname }} />
  }

  return <Outlet />
}
