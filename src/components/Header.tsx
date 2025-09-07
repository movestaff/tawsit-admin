import React, { useEffect, useRef, useState } from 'react'
import { useAuthStore } from '../store/authStore'
import LogoutButton from './LogoutButton'

export default function Header() {
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Nom d'affichage issu du store (hydraté via /profiles/me)
  const displayName = useAuthStore((s) => s.profile?.display_name)

  // Fermer le menu au clic extérieur et via la touche Échap
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('click', onDocClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('click', onDocClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [])

  return (
    // Header desktop (le header mobile est géré dans le DashboardLayout)
    <header className="hidden md:flex items-center justify-between bg-white text-gray-800 shadow px-6 py-3">
      {/* Espace gauche : logo/titre si besoin */}
      <div className="flex items-center gap-3">{/* logo ou titre ici */}</div>

      {/* Menu utilisateur (avatar + nom + dropdown) */}
      <div className="relative" ref={menuRef}>
        <button
          type="button"
          aria-haspopup="menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-2 focus:outline-none"
        >
          {/* Avatar vert forêt avec icône */}
          <div className="w-12 h-12 rounded-full flex items-center justify-center bg-[#228B22] text-white">
            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5.121 17.804A11.955 11.955 0 0112 15c2.21 0 4.267.597 6.001 1.629M15 10a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>

          {/* Nom à droite de l’avatar (fallback si vide) */}
          <span className="font-medium text-gray-700">{displayName || 'Utilisateur'}</span>

          {/* Petite flèche */}
          <svg className="w-4 h-4 text-gray-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Dropdown */}
        {open && (
          <div
            role="menu"
            className="absolute right-0 top-full mt-2 w-56 bg-white border rounded-md shadow-lg p-2 z-50"
          >
            <LogoutButton />
          </div>
        )}
      </div>
    </header>
  )
}
