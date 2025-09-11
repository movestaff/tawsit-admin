// src/pages/AuthCallback.tsx
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { toast } from 'react-toastify'

export default function AuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    (async () => {
      try {
        // 1) créer la session à partir du code/jeton présents dans l'URL
        await supabase.auth.exchangeCodeForSession(window.location.href)

        // 2) rediriger vers "next" si présent, sinon /reset-password
        const url = new URL(window.location.href)
        const next = url.searchParams.get('next') || '/reset-password'

        navigate(next, { replace: true })
      } catch (e: any) {
        toast.error(e?.message || 'Impossible de finaliser la connexion')
        navigate('/', { replace: true })
      }
    })()
  }, [navigate])

  return <div style={{ padding: 24, textAlign: 'center' }}>Finalisation…</div>
}
