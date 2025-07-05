// ✅ src/App.tsx
import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Tournees from './pages/Tournees'
import Carte from './pages/Carte'
import Parametres from './pages/parametres'
import DashboardLayout from './components/layouts/DashboardLayout'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Employes from './pages/Employes'
import Conducteurs from './pages/Conducteurs'
import LoginPage from './pages/LoginPage'


function App() {
  return (
    <BrowserRouter>
      <DashboardLayout>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/Dashboard" element={<Dashboard />} />
          <Route path="/carte" element={<Carte />} />
          <Route path="/tournees" element={<Tournees />} />
          <Route path="/parametres" element={<Parametres />} />
          <Route path="/employes" element={<Employes />} />
          <Route path="/conducteurs" element={<Conducteurs />} />
        </Routes>
        <ToastContainer position="bottom-right" autoClose={3000} />
      </DashboardLayout>
    </BrowserRouter>
  )
}

export default App



