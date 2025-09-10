// src/components/RequirePasswordChange.tsx
import { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

type Props = { children: React.ReactNode }


export default function RequirePasswordChange({ children }: Props) {
  const [loading, setLoading] = useState(true)
  const [mustChange, setMustChange] = useState(false)
  const location = useLocation()

  useEffect(() => {
    let mounted = true
    ;(async () => {
      const { data, error } = await supabase.auth.getUser()
      if (!mounted) return
      if (error) {
        // En cas d’erreur d’auth, on laisse le PrivateRoute gérer la redirection vers /login
        setMustChange(false)
        setLoading(false)
        return
      }
      const flag =
        (data.user?.user_metadata && data.user.user_metadata.must_change_password === true) || false
      setMustChange(flag)
      setLoading(false)
    })()
    return () => {
      mounted = false
    }
  }, [location.key])

  if (loading) return <div /> // évite le flicker, on peux mettre un spinner si tu veux
  if (mustChange && location.pathname !== '/reset-password') {
    return <Navigate to="/reset-password" replace />
  }
  return children
}
