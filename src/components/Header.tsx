import React from 'react'
import { Link } from 'react-router-dom'
import logo from '../assets/logo.png' // adapte le chemin si besoin

function Header() {
  return (
    <header className="bg-[#063606] text-white shadow-md w-full">
      <div className="w-full px-4 py-1 flex items-center justify-between">
        {/* Logo + Titre */}
        <div className="flex items-center gap-3">
          <img src={logo} alt="Logo Tawsit" className="h-12 w-auto sm:h-14 md:h-16" />
          <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold">
            
          </h1>
        </div>

        {/* Liens de navigation */}
        <nav className="hidden sm:flex gap-6 text-sm font-medium">
          <Link to="/" className="hover:underline">🏠 Accueil</Link>
          <Link to="/tournees" className="hover:underline">🚌 Tournées</Link>
          <Link to="/conducteurs" className="hover:underline">👨‍✈️ Conducteurs</Link>
        </nav>
      </div>
    </header>
  )
}

export default Header


