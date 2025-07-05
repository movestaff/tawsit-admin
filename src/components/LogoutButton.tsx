import React from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuthStore } from '../store/authStore'
import { Button } from './ui/button'
import { FiLogOut } from 'react-icons/fi'

export default function LogoutButton() {
  const navigate = useNavigate()
  const logout = useAuthStore((state) => state.logout)

  const handleLogout = async () => {
    await supabase.auth.signOut()         // 🔐 Supprime la session navigateur
    logout()                              // 🔁 Réinitialise Zustand et localStorage
    navigate('/')                         // ↩️ Redirige vers login
  }

  return (
    <Button
      onClick={handleLogout}
      className="w-full flex items-center justify-start gap-2 text-left bg-red-600 hover:bg-red-700 text-white"
    >
      <FiLogOut /> Déconnexion
    </Button>
  )
}
