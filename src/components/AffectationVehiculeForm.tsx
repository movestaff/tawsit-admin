import React, { useEffect, useState } from 'react'
import { Button } from './ui/button'
import { fetchVehicules, affecterVehiculeConducteur } from '../lib/api'
import { toast } from 'react-toastify'

interface Props {
  conducteurId: string
  onAffectationComplete: () => void
}

const AffectationVehiculeForm: React.FC<Props> = ({ conducteurId, onAffectationComplete }) => {
  const [vehicules, setVehicules] = useState<any[]>([])
  const [selectedVehiculeId, setSelectedVehiculeId] = useState('')

  useEffect(() => {
    const charger = async () => {
      try {
        const data = await fetchVehicules()
        setVehicules(data)
      } catch (e) {
        toast.error('Erreur lors du chargement des véhicules')
      }
    }
    charger()
  }, [])

  const handleAffectation = async () => {
    if (!selectedVehiculeId) return toast.error('Veuillez choisir un véhicule')
    try {
      await affecterVehiculeConducteur({ conducteur_id: conducteurId, vehicule_id: selectedVehiculeId })
      toast.success('Affectation véhicule réussie')
      onAffectationComplete()
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de l’affectation')
    }
  }

  return (
    <div className="space-y-4 bg-white border rounded shadow p-4 mt-4">
      <h2 className="text-lg font-semibold">Affecter un véhicule</h2>
      <select
        className="border rounded px-2 py-2 w-full"
        value={selectedVehiculeId}
        onChange={(e) => setSelectedVehiculeId(e.target.value)}
      >
        <option value="">-- Choisir un véhicule --</option>
        {vehicules.map((v) => (
          <option key={v.id} value={v.id}>
            {v.immatriculation} - {v.marque} {v.modele}
          </option>
        ))}
      </select>
      <Button 
        type='button'
        onClick={handleAffectation}
      >Affecter</Button>
    </div>
  )
}

export default AffectationVehiculeForm
