// src/store/authStore.ts
import { create } from 'zustand'
import { loadProfile, type ProfileDTO } from '../lib/api' // <— ajuste le chemin si besoin

interface AuthState {
  // Etat d'auth
  isAuthenticated: boolean
  token: string | null
  user: any | null

  // Profil (table 'profiles')
  profile: ProfileDTO | null // { id: string; display_name: string | null }

  // Multi-tenant
  selectedSocieteId: string | null

  // Actions
  login: (token: string, user: any) => Promise<void>
  logout: () => void
  checkSession: () => Promise<void>
  initAuthListener: () => void // no-op pour le web admin
  setSocieteId: (societeId: string) => void
  setProfile: (profile: ProfileDTO | null) => void
}

// ---- Helpers internes ----
function readLS<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function writeLS(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value))
}

function clearAllAuthStorage() {
  localStorage.clear()
}

export const useAuthStore = create<AuthState>((set, get) => ({
  // Etat initial depuis localStorage (token backend)
  isAuthenticated: !!localStorage.getItem('token'),
  token: localStorage.getItem('token'),
  user: readLS<any>('user', null),
  profile: readLS<ProfileDTO | null>('profile', null),
  selectedSocieteId: localStorage.getItem('selectedSocieteId'),

  /**
   * Appelé après /authM/login-multi (backend).
   * - Persiste token + user
   * - Charge le profil (/profiles/me) et fallback si nécessaire
   */
  login: async (token, user) => {
    localStorage.setItem('token', token)
    writeLS('user', user)
    set({ isAuthenticated: true, token, user })

    // Tente de charger le profil depuis l'API
    let profile: ProfileDTO | null = null
    try {
      profile = await loadProfile()
    } catch {
      // ignore
    }

    // Fallback si l'API profil échoue : tente de dériver un display_name du payload user
    if (!profile) {
      const dn =
        user?.display_name ||
        user?.name ||
        user?.user_metadata?.display_name ||
        user?.user_metadata?.full_name ||
        null
      profile = dn ? { id: user?.id || 'me', display_name: dn } : null
    }

    set({ profile })
    if (profile) writeLS('profile', profile)
  },

  /**
   * Déconnexion propre :
   * - Vide le localStorage
   * - Réinitialise le store
   * - Redirige vers /
   */
  logout: () => {
    clearAllAuthStorage()
    set({
      isAuthenticated: false,
      token: null,
      user: null,
      profile: null,
      selectedSocieteId: null,
    })
    if (window.location.pathname !== '/') {
      window.location.href = '/'
    }
  },

  /**
   * Vérifie la session côté web admin :
   * - Se base sur la présence du token + user dans le localStorage
   * - Recharge le profil si manquant
   */
  checkSession: async () => {
    const token = localStorage.getItem('token')
    const user = readLS<any>('user', null)

    if (!token || !user) {
      get().logout()
      return
    }

    set({ isAuthenticated: true, token, user })

    // Recharge le profil si absent
    if (!get().profile) {
      let profile: ProfileDTO | null = null
      try {
        profile = await loadProfile()
      } catch {
        // ignore
      }
      if (!profile) {
        const dn =
          user?.display_name ||
          user?.name ||
          user?.user_metadata?.display_name ||
          user?.user_metadata?.full_name ||
          null
        profile = dn ? { id: user?.id || 'me', display_name: dn } : null
      }
      set({ profile })
      if (profile) writeLS('profile', profile)
    }
  },

  /**
   * Ecouteur d'auth — no-op pour le web admin.
   * (Si un jour tu utilises Supabase Auth sur le web, tu pourras l'activer ici.)
   */
  initAuthListener: () => {},

  /**
   * Multi-tenant : setter de la société active
   */
  setSocieteId: (societeId) => {
    localStorage.setItem('selectedSocieteId', societeId)
    localStorage.setItem('societeSelectionneeManuellement', 'true')
    set({ selectedSocieteId: societeId })
  },

  /**
   * Setter profil manuel si besoin (ex: après mise à jour du profil)
   */
  setProfile: (profile) => {
    if (profile) writeLS('profile', profile)
    else localStorage.removeItem('profile')
    set({ profile })
  },
}))
