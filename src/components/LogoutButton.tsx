import React from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuthStore } from '../store/authStore'
import { FiLogOut } from 'react-icons/fi'

export default function LogoutButton() {
  const navigate = useNavigate()
  const logout = useAuthStore((state) => state.logout)

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault()
    await supabase.auth.signOut()
    logout()
    navigate('/')
  }

  return (
    <a
      href="#"
      onClick={handleLogout}
      className="flex items-center gap-2 text-gray-800 hover:text-[#7e7e7e] no-underline hover:no-underline"
    >
      <FiLogOut className="text-lg" /> Déconnexion
    </a>
  )
}