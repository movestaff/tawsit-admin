//src/lib/hooks/ useUserProfile.ts

import { useEffect, useState } from 'react'
import { getAuthHeaders } from '../api' 
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

export function useUserProfile() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/authM/me`, {
          method: 'GET',
          headers: getAuthHeaders('application/json'),
        })
        if (!res.ok) throw new Error('Erreur profil utilisateur')
        const data = await res.json()
        setProfile(data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

  return { profile, loading, error }
}
