// src/components/AuthLinkHandler.tsx
import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

/**
 * Monte ce composant une seule fois (haut de l'arbre) pour gérer:
 * - Lien "recovery" (email) => crée la session via exchangeCodeForSession
 * - Puis redirige vers /reset-password
 */
export default function AuthLinkHandler() {
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const url = window.location.href

    // On détecte un callback Supabase (hash ou querystring)
    const hasHash = url.includes('#')
    const hasCode = url.includes('code=')
    const isRecoveryType = url.includes('type=recovery') || url.includes('recovery')

    if (!hasHash && !hasCode && !isRecoveryType) return

    // Échange le code/lien contre une session active
    ;(async () => {
      try {
        const { error } = await supabase.auth.exchangeCodeForSession(url)
        if (error) {
          console.warn('exchangeCodeForSession error:', error.message)
          return
        }

        // Nettoie l’URL (supprime tokens/hash) sans recharger
        const cleanUrl = window.location.pathname + window.location.search
        window.history.replaceState({}, document.title, cleanUrl)

        // Redirige vers l’écran de changement de mot de passe
        navigate('/reset-password', { replace: true })
      } catch (e) {
        console.warn('exchangeCodeForSession failed:', e)
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.key])

  return null
}
