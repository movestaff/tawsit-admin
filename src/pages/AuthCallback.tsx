import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { toast } from 'react-toastify'

function parseHashParams(hash: string): Record<string, string> {
  const h = hash.startsWith('#') ? hash.slice(1) : hash
  if (!h) return {}
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
      const url = new URL(window.location.href)
      const next = url.searchParams.get('next') || '/reset-password'

      // 0) Si Supabase renvoie une erreur dans le hash (#error=..., error_code=...)
      const hashParams = parseHashParams(window.location.hash || '')
      const errCode = hashParams['error_code']
      const errDesc = hashParams['error_description'] || hashParams['error']

      if (errCode) {
        // Cas classique: otp_expired, access_denied, etc.
        // On informe l'utilisateur et on le renvoie proprement vers la page de login,
        // en l'invitant à demander un NOUVEAU lien.
        toast.error(
          errCode === 'otp_expired'
            ? 'Le lien a expiré ou a déjà été utilisé. Demandez un nouveau lien.'
            : `Erreur d’authentification: ${errDesc || errCode}`
        )
        navigate('/', { replace: true })
        return
      }

      // 1) Tentative standard: ?code=... (PKCE)
      try {
        const { data, error } = await supabase.auth.exchangeCodeForSession(window.location.href)
        if (!error && data?.session) {
          navigate(next, { replace: true })
          return
        }
      } catch {
        // on tentera le fallback hash
      }

      // 2) Fallback hash tokens: #access_token=...&refresh_token=...
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

      // 3) Si aucune méthode n’a marché
      toast.error('Lien invalide. Demandez un nouveau lien.')
      navigate('/', { replace: true })
    })().catch(() => {
      toast.error('Impossible de finaliser la connexion')
      navigate('/', { replace: true })
    })
  }, [navigate])

  return <div style={{ padding: 24, textAlign: 'center' }}>Finalisation…</div>
}
