import React, { useEffect, useState } from 'react'
import { Button } from './ui/button'
import { fetchTourneesDisponibles, affecterTourneeConducteur } from '../lib/api'
import { toast } from 'react-toastify'

interface Props {
  conducteurId: string
  onAffectationComplete: () => void
}

const AffectationFormConducteur: React.FC<Props> = ({ conducteurId, onAffectationComplete }) => {
  const [tournees, setTournees] = useState<any[]>([])
  const [selectedTourneeId, setSelectedTourneeId] = useState('')

  useEffect(() => {
    const charger = async () => {
      try {
        const data = await fetchTourneesDisponibles()
        setTournees(data)
      } catch (e) {
        toast.error('Erreur lors du chargement des tournées disponibles')
      }
    }
    charger()
  }, [])

  const handleAffectation = async () => {
    if (!selectedTourneeId) return toast.error('Veuillez choisir une tournée')
    try {
      await affecterTourneeConducteur(selectedTourneeId, conducteurId)
      toast.success('Affectation réussie')
      setSelectedTourneeId('')
      onAffectationComplete()
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de l’affectation')
    }
  }

  return (
    <div className="space-y-4 bg-white border rounded shadow p-4 mt-4">
      <h2 className="text-lg font-semibold">Affecter à une tournée</h2>
      <div>
        <select
          className="border rounded px-2 py-2 w-full"
          value={selectedTourneeId}
          onChange={e => setSelectedTourneeId(e.target.value)}
        >
          <option value="">-- Choisir une tournée disponible --</option>
          {tournees.map((t) => (
            <option key={t.id} value={t.id}>
              {t.nom || t.adresse} | {t.date} | Départ : {t.hr_depart_prevu}
            </option>
          ))}
        </select>
      </div>
      <Button type='button' onClick={handleAffectation}>Affecter</Button>
    </div>
  )
}

export default AffectationFormConducteur
