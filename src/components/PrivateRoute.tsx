
// src/components/PrivateRoute.tsx
import React, { useEffect, useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import type { ReactElement } from 'react'
import { useAuthStore } from '../store/authStore'
import { supabase } from '../lib/supabaseClient'

export default function PrivateRoute({ children }: { children: ReactElement }) {
  const { isAuthenticated, selectedSocieteId, checkSession, token, logout } = useAuthStore()
  const location = useLocation()
  const [isCheckingSession, setIsCheckingSession] = useState(true)

  const selectionValidee = localStorage.getItem('societeSelectionneeManuellement') === 'true'

  useEffect(() => {
    const verifierSession = async () => {
      await checkSession()
      setIsCheckingSession(false)
    }

    
    verifierSession()

      // Vérification périodique toutes les minutes
    const interval = setInterval(async () => {
      const { data } = await supabase.auth.getSession()
      if (!data.session) {
        logout()
        
      }
    }, 60 * 1000) // chaque minute

    return () => clearInterval(interval)
  }, [checkSession, logout])
  

  if (isCheckingSession) {
    // ✅ Important : spinner ou placeholder qui évite unmount complet
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        Vérification de session en cours...
      </div>
    )
  }

  if (!isAuthenticated || !token) {
    return <Navigate to="/" state={{ from: location }} replace />
  }

  if ((!selectedSocieteId || !selectionValidee) && location.pathname !== '/select-societe') {
    return <Navigate to="/select-societe" replace />
  }

  return children
}
