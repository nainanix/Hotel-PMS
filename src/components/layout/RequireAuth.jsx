import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

function RequireAuth() {
  const auth = useAuth()

  if (auth.loading) return null
  if (!auth.isAuthenticated) return <Navigate to="/login" replace />
  return <Outlet />
}

export default RequireAuth
