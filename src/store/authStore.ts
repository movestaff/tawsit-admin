// src/store/authStore.ts
import { create } from 'zustand'
import { supabase } from '../lib/supabaseClient'

interface AuthState {
  isAuthenticated: boolean
  token: string | null
  user: any
  selectedSocieteId: string | null

  login: (token: string, user: any) => void
  setSocieteId: (societeId: string) => void
  logout: () => void
  checkSession: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  token: null,
  user: null,
  selectedSocieteId: localStorage.getItem('selectedSocieteId'),

  login: (token, user) => {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
    set({ isAuthenticated: true, token, user })
  },

  setSocieteId: (societeId) => {
    localStorage.setItem('selectedSocieteId', societeId)
    localStorage.setItem('societeSelectionneeManuellement', 'true')
    set({ selectedSocieteId: societeId })
  },

  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('selectedSocieteId')
    localStorage.removeItem('societeSelectionneeManuellement')
    set({ isAuthenticated: false, token: null, user: null, selectedSocieteId: null })
  },

  checkSession: async () => {
    console.log('🟡 Vérification de session en cours...')
    const { data, error } = await supabase.auth.getSession()
     console.log('📦 Résultat getSession:', data)
    if (!data.session || error) {

      console.warn('❌ Session invalide, déconnexion forcée')
      // ❌ Session invalide → déconnexion forcée
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('selectedSocieteId')
      localStorage.removeItem('societeSelectionneeManuellement')
      set({ isAuthenticated: false, token: null, user: null, selectedSocieteId: null })
    } else {

      console.log('✅ Session valide détectée')
      const token = data.session.access_token
      const user = data.session.user
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      set({ isAuthenticated: true, token, user })
    }
  }
}))
