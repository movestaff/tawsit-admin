// src/components/layouts/DashboardLayout.tsx
import React, { Suspense, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { FaTachometerAlt, FaMapMarkerAlt, FaBus, FaUsersCog, FaCogs, FaCalendarAlt, FaReceipt, FaBars, FaTimes } from 'react-icons/fa'
import logo from '../../assets/logo.png'
import LogoutButton from '../LogoutButton'
import Header from '../Header'


const SidebarLinks = ({ onClick }: { onClick?: () => void }) => (
  <nav className="flex-1 px-4 py-6 space-y-4 text-sm font-medium">
    <NavLink to="/dashboard" className={nav => `flex items-center gap-2 px-3 py-2 rounded-md hover:bg-green-700 transition ${nav.isActive ? 'bg-green-800' : ''}`} onClick={onClick}>
      <FaTachometerAlt /> Tableau de bord
    </NavLink>
    <NavLink to="/carte" className={nav => `flex items-center gap-2 px-3 py-2 rounded-md hover:bg-green-700 transition ${nav.isActive ? 'bg-green-800' : ''}`} onClick={onClick}>
      <FaMapMarkerAlt /> Carte temps réel
    </NavLink>
    <NavLink to="/gestion-tournee" className={nav => `flex items-center gap-2 px-3 py-2 rounded-md hover:bg-green-700 transition ${nav.isActive ? 'bg-green-800' : ''}`} onClick={onClick}>
      <FaBus /> Gestion des tournées
    </NavLink>
    <NavLink to="/planificationcalendrier" className={nav => `flex items-center gap-2 px-3 py-2 rounded-md hover:bg-green-700 transition ${nav.isActive ? 'bg-green-800' : ''}`} onClick={onClick}>
      <FaCalendarAlt /> Gestion des planifications
    </NavLink>
    <NavLink to="/parametres" className={nav => `flex items-center gap-2 px-3 py-2 rounded-md hover:bg-green-700 transition ${nav.isActive ? 'bg-green-800' : ''}`} onClick={onClick}>
      <FaUsersCog /> Paramétrage
    </NavLink>
    <NavLink to="/contrats" className={nav => `flex items-center gap-2 px-3 py-2 rounded-md hover:bg-green-700 transition ${nav.isActive ? 'bg-green-800' : ''}`} onClick={onClick}>
      <FaUsersCog /> Gestion des contrats
    </NavLink>
    <NavLink to="/facturation" className={nav => `flex items-center gap-2 px-3 py-2 rounded-md hover:bg-green-700 transition ${nav.isActive ? 'bg-green-800' : ''}`} onClick={onClick}>
      <FaReceipt /> Facturation
    </NavLink>
    <NavLink to="/configuration-systeme" className={nav => `flex items-center gap-2 px-3 py-2 rounded-md hover:bg-green-700 transition ${nav.isActive ? 'bg-green-800' : ''}`} onClick={onClick}>
      <FaCogs /> Configuration système
    </NavLink>
  </nav>
)

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar desktop */}
      <aside className="w-64 bg-[#063606] text-white flex-col hidden md:flex">
        <div className="flex items-center gap-2 px-4 py-5 border-b border-green-900">
          <img src={logo} alt="Logo Tawsit" className="h-12 w-auto mr-3" />
          <span className="font-bold text-lg tracking-wide"></span>
        </div>
        <SidebarLinks />
        
      </aside>

      {/* Sidebar mobile */}
      <div className="md:hidden fixed top-0 left-0 w-full z-40">
        <div className="flex items-center justify-between bg-[#063606] px-4 py-3 border-b border-green-900">
          <img src={logo} alt="Logo Tawsit" className="h-10 w-auto" />
          <button
            className="text-white text-2xl"
            onClick={() => setSidebarOpen(true)}
          >
            <FaBars />
          </button>
        </div>
        {/* Overlay menu */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex">
            <aside className="bg-[#063606] text-white w-64 h-full flex flex-col animate-slideInLeft">
              <div className="flex items-center justify-between px-4 py-5 border-b border-green-900">
                <img src={logo} alt="Logo Tawsit" className="h-10 w-auto" />
                <button className="text-white text-2xl" onClick={() => setSidebarOpen(false)}>
                  <FaTimes />
                </button>
              </div>
              <SidebarLinks onClick={() => setSidebarOpen(false)} />
              <div className="mt-auto px-4 pb-6">
                <LogoutButton />
              </div>
            </aside>
            <div className="flex-1" onClick={() => setSidebarOpen(false)} />
          </div>
        )}
      </div>

      {/* Contenu principal */}

      <div className="flex-1 flex flex-col">
      <Header />
      <main className="flex-1 p-6 overflow-y-auto mt-[64px] md:mt-0">
        <Suspense fallback={<div style={{ textAlign: 'center', marginTop: '2rem' }}>Chargement du module...</div>}>
          {children}
        </Suspense>
      </main>
      </div>
    </div>
  )
}

export default DashboardLayout
