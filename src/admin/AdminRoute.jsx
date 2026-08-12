import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// Hanya email ini yang boleh akses panel admin
const ADMIN_EMAIL = 'admin@gadgetkita.com'

export default function AdminRoute({ children }) {
  const { user, loading } = useAuth()

  // Tunggu sampai sesi Supabase selesai dicek
  if (loading) return null

  // Blokir jika tidak login atau bukan admin
  if (!user || user.email !== ADMIN_EMAIL) {
    return <Navigate to="/admin/login" replace />
  }

  return children
}
