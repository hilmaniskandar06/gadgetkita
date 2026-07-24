import { createContext, useContext, useState, useEffect } from 'react'
import { useToast } from './ToastContext'
import { supabase } from '../config/supabase'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const { addToast } = useToast()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        fetchProfile(session.user)
      } else {
        setUser(null)
        setLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        fetchProfile(session.user)
      } else {
        setUser(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function fetchProfile(authUser) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .single()
      
    if (data) {
      setUser({ ...data, email: authUser.email })
    } else {
      setUser({ id: authUser.id, email: authUser.email })
    }
    setLoading(false)
  }

  async function login(email, password) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      let msg = error.message;
      if (msg === 'Email not confirmed') msg = 'Email belum diverifikasi. Pastikan fitur "Confirm Email" di Supabase sudah dimatikan, lalu daftar pakai email baru.';
      if (msg === 'Invalid login credentials') msg = 'Email atau password salah';
      return { success: false, error: msg }
    }
    return { success: true }
  }

  async function register(data) {
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.name
        }
      }
    })

    if (error) {
      return { success: false, error: error.message }
    }

    // Jika butuh menyimpan data ekstra
    if (authData.user && (data.phone || data.address)) {
      await supabase.from('profiles').update({
        phone: data.phone,
        address: data.address
      }).eq('id', authData.user.id)
    }

    return { success: true }
  }

  async function logout() {
    await supabase.auth.signOut()
    setUser(null)
  }

  async function updateProfile(updates) {
    if (!user) return
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)

    if (error) {
      addToast('Gagal memperbarui profil: ' + error.message, 'error')
      return
    }

    setUser(prev => ({ ...prev, ...updates }))
    addToast('Profil berhasil diperbarui')
  }

  async function deleteAccount(id) {
    addToast('Silakan hubungi admin untuk menghapus akun', 'error')
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateProfile, deleteAccount, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
