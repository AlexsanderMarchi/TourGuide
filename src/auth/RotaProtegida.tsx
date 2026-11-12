import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

// Manda para /login quem não está logado, lembrando de onde veio.
export default function RotaProtegida() {
  const logado = useAuthStore((estado) => estado.logado)
  const location = useLocation()

  if (!logado) {
    return <Navigate to="/login" replace state={{ de: location.pathname }} />
  }

  return <Outlet />
}
