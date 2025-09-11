import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { toast } from 'react-toastify'

function parseHashParams(hash: string): Record<string, string> {
  const h = hash.startsWith('#') ? hash.slice(1) : hash
  return h.split('&').reduce((acc, kv) => {
    const [k, v] = kv.split('=')
    if (k) acc[decodeURIComponent(k)] = decodeURIComponent(v || '')
    return acc
  }, {} as Record<string, string>)
}

export default function AuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    (async () => {
      try {
        const url = new URL(window.location.href)
        const next = url.searchParams.get('next') || '/reset-password'

        // 1) Tentative standard: ?code=... (PKCE / magic-link "code")
        try {
          const { data, error } = await supabase.auth.exchangeCodeForSession(window.location.href)
          if (!error && data?.session) {
            navigate(next, { replace: true })
            return
          }
        } catch {
          // on essaye le fallback hash
        }

        // 2) Fallback hash: #access_token=...&refresh_token=... (certains flows "recovery")
        const hashParams = parseHashParams(window.location.hash || '')
        const access_token = hashParams['access_token']
        const refresh_token = hashParams['refresh_token']

        if (access_token && refresh_token) {
          const { data: setData, error: setErr } = await supabase.auth.setSession({
            access_token,
            refresh_token,
          })
          if (!setErr && setData?.session) {
            navigate(next, { replace: true })
            return
          }
        }

        // 3) Si aucune des deux méthodes n'a marché → on renvoie à la page d'accueil
        throw new Error('Aucun code ni token utilisable dans l’URL de callback.')
      } catch (e: any) {
        toast.error(e?.message || 'Impossible de finaliser la connexion')
        navigate('/', { replace: true })
      }
    })()
  }, [navigate])

  return <div style={{ padding: 24, textAlign: 'center' }}>Finalisation…</div>
}
