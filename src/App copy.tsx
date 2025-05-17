import React from 'react'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Tournees from './pages/Tournees'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Header from '../src/components/Header'
import DashboardLayout from './components/layouts/DashboardLayout'


function App() {
  return (
    <BrowserRouter>
     
       
      <Header />

        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/tournees" element={<Tournees />} />
        </Routes>

        {/* ✅ Conteneur des notifications */}
        <ToastContainer position="bottom-right" autoClose={3000} />
      
    </BrowserRouter>
  )
}

export default App


