import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { Button } from '../components/ui/button'
import { Label } from '../components/ui/label'

interface Societe {
  id: string
  nom: string
}

export default function SelectSocietePage() {
  const navigate = useNavigate()
  const { setSocieteId, selectedSocieteId } = useAuthStore()
  const [societes, setSocietes] = useState<Societe[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(selectedSocieteId)

  useEffect(() => {
    const fetchSocietes = async () => {
      const groupeId = localStorage.getItem('groupe_id')
      const societesAutorisees = JSON.parse(localStorage.getItem('societes') || '[]')

      if (!groupeId || !societesAutorisees.length) return

      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/societes?groupe_id=${groupeId}`)
        const data = await res.json()

        if (res.ok) {
          const filtered = data.filter((s: Societe) => societesAutorisees.includes(s.id))
          setSocietes(filtered)
        }
      } catch (err) {
        console.error('Erreur lors du chargement des sociétés', err)
      }
    }

    fetchSocietes()
  }, [])

  const handleValidation = () => {
    if (!selectedId) return
    setSocieteId(selectedId)
    localStorage.setItem('societe_id', selectedId)
    localStorage.setItem('societeSelectionneeManuellement', 'true') // ✅ Flag explicite
    window.location.href = '/dashboard' // ✅ Redirection forcée pour rafraîchir l’état
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-xl font-bold text-green-700 mb-4 text-center">
          Sélectionnez une société
        </h2>

        <div className="mb-4">
          <Label htmlFor="societe">Société</Label>
          <select
            id="societe"
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:border-green-600"
            value={selectedId || ''}
            onChange={(e) => setSelectedId(e.target.value)}
          >
            <option value="">-- Choisir une société --</option>
            {societes.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nom}
              </option>
            ))}
          </select>
        </div>

        <Button
          className="w-full"
          onClick={handleValidation}
          disabled={!selectedId}
        >
          Accéder au tableau de bord
        </Button>
      </div>
    </div>
  )
}
