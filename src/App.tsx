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

function App() {
  return (
    <BrowserRouter>
      <DashboardLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/carte" element={<Carte />} />
          <Route path="/tournees" element={<Tournees />} />
          <Route path="/parametres" element={<Parametres />} />
        </Routes>
        <ToastContainer position="bottom-right" autoClose={3000} />
      </DashboardLayout>
    </BrowserRouter>
  )
}

export default App



