// ✅ Fichier : src/components/layouts/DashboardLayout.tsx
import React, { Suspense } from 'react'
import { NavLink } from 'react-router-dom'
import { FaTachometerAlt, FaMapMarkerAlt, FaBus, FaUsersCog, FaCogs, FaCalendarAlt, FaReceipt } from 'react-icons/fa'
import logo from '../../assets/logo.png'
import LogoutButton from '../LogoutButton'

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-[#063606] text-white flex flex-col">
        <div className="flex items-center gap-2 px-4 py-5 border-b border-green-900">
          <img src={logo} alt="Logo Tawsit" className="h-12 w-auto mr-3" />
          <span className="font-bold text-lg tracking-wide"></span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-4 text-sm font-medium">
          <NavLink to="/dashboard" className={({ isActive }) =>
            `flex items-center gap-2 px-3 py-2 rounded-md hover:bg-green-700 transition ${isActive ? 'bg-green-800' : ''}`
          }>
            <FaTachometerAlt /> Tableau de bord
          </NavLink>
          <NavLink to="/carte" className={({ isActive }) =>
            `flex items-center gap-2 px-3 py-2 rounded-md hover:bg-green-700 transition ${isActive ? 'bg-green-800' : ''}`
          }>
            <FaMapMarkerAlt /> Carte temps réel
          </NavLink>
          <NavLink to="/gestion-tournee" className={({ isActive }) =>
            `flex items-center gap-2 px-3 py-2 rounded-md hover:bg-green-700 transition ${isActive ? 'bg-green-800' : ''}`
          }>
            <FaBus /> Gestion des tournées
          </NavLink>
          <NavLink to="/planificationcalendrier" className={({ isActive }) =>
            `flex items-center gap-2 px-3 py-2 rounded-md hover:bg-green-700 transition ${isActive ? 'bg-green-800' : ''}`
          }>
            <FaCalendarAlt /> Gestion des planifications
          </NavLink>
          <NavLink to="/parametres" className={({ isActive }) =>
            `flex items-center gap-2 px-3 py-2 rounded-md hover:bg-green-700 transition ${isActive ? 'bg-green-800' : ''}`
          }>
            <FaUsersCog /> Paramétrage
          </NavLink>
          <NavLink to="/contrats" className={({ isActive }) =>
            `flex items-center gap-2 px-3 py-2 rounded-md hover:bg-green-700 transition ${isActive ? 'bg-green-800' : ''}`
          }>
            <FaUsersCog /> Gestion des contrats
          </NavLink>
          <NavLink to="/facturation" className={({ isActive }) =>
            `flex items-center gap-2 px-3 py-2 rounded-md hover:bg-green-700 transition ${isActive ? 'bg-green-800' : ''}`
          }>
            <FaReceipt /> Facturation
          </NavLink>
          <NavLink to="/config" className={({ isActive }) =>
            `flex items-center gap-2 px-3 py-2 rounded-md hover:bg-green-700 transition ${isActive ? 'bg-green-800' : ''}`
          }>
            <FaCogs /> Configuration système
          </NavLink>
        </nav>

        <div className="mt-auto px-4 pb-6">
          <LogoutButton />
        </div>
      </aside>

      {/* Contenu principal */}
      <main className="flex-1 p-6 overflow-y-auto">
        <Suspense fallback={<div style={{ textAlign: 'center', marginTop: '2rem' }}>Chargement du module...</div>}>
          {children}
        </Suspense>
      </main>
    </div>
  )
}

export default DashboardLayout
