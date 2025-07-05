// ✅ Fichier : src/components/AffectationForm.tsx
import React, { useEffect, useState } from 'react'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Button } from './ui/button'
import { toast } from 'react-toastify'
import { ajouterAffectationEmploye } from '../lib/api'
import { fetchTourneesAvecAuth, fetchPointsArretAvecAuth } from '../lib/api'

interface Props {
  employeId: string
  onAffectationComplete: () => void
}

const AffectationForm: React.FC<Props> = ({ employeId, onAffectationComplete }) => {
  

  const [tournees, setTournees] = useState<any[]>([])
  const [selectedTourneeId, setSelectedTourneeId] = useState('')
  const [tourneeType, setTourneeType] = useState('')
  const [ordre, setOrdre] = useState('')
  const [pointArretId, setPointArretId] = useState('')
  const [pointsArret, setPointsArret] = useState<any[]>([])

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

  

useEffect(() => {
  const charger = async () => {
    try {
      const data = await fetchTourneesAvecAuth()
      setTournees(data)
    } catch (e) {
      toast.error('Erreur lors du chargement des tournées')
    }
  }
  charger()
}, [])

useEffect(() => {
  if (!selectedTourneeId) return

  const tournee = tournees.find((t) => t.id === selectedTourneeId)
  if (tournee) {
    setTourneeType(tournee.type)

    if (tournee.type === 'fixe') {
      fetchPointsArretAvecAuth(tournee.id)
        .then((data) => {
          if (Array.isArray(data)) {
            setPointsArret(data)
          } else {
            setPointsArret([])
            toast.error('Format de données invalide pour points arrêt')
          }
        })
        .catch((err) => {
          console.error('❌ Erreur points-arret:', err)
          toast.error('Erreur chargement points arrêt')
        })
    }
  }
}, [selectedTourneeId, tournees])



const handleAffectation = async () => {
  if (!selectedTourneeId) return toast.error('Veuillez choisir une tournée')

  const payload =
    tourneeType === 'fixe'
      ? {
          employe_id: employeId,
          point_arret_id: pointArretId,
          tournee_id: selectedTourneeId,
          type: 'fixe'
        }
      : {
          employe_id: employeId,
          tournee_id: selectedTourneeId,
          ordre_embarquement: parseInt(ordre || '0'),
          type: 'flexible'
        }

  try {
    await ajouterAffectationEmploye(payload)
    toast.success('Affectation réussie')
    onAffectationComplete()
  } catch (err: any) {
    toast.error(err.message || 'Erreur lors de l’affectation')
  }
}
  return (
    <div className="space-y-4 bg-white border rounded shadow p-4 mt-4">
      <h2 className="text-lg font-semibold">Affecter à une tournée</h2>

      <div>
        <Label htmlFor="tournee">Tournée</Label>
        <select
          id="tournee"
          className="border rounded px-2 py-2 w-full"
          value={selectedTourneeId}
          onChange={(e) => {
            setSelectedTourneeId(e.target.value)
            setPointArretId('')
            setOrdre('')
          }}
        >
          <option value="">-- Choisir une tournée --</option>
          {tournees.map((t) => (
            <option key={t.id} value={t.id}>
              {t.nom} ({t.type})
            </option>
          ))}
        </select>
      </div>

      {tourneeType === 'flexible' && (
        <div>
          <Label htmlFor="ordre">Ordre d’embarquement</Label>
          <Input
            id="ordre"
            type="number"
            value={ordre}
            onChange={(e) => setOrdre(e.target.value)}
            placeholder="Ex: 1"
          />
        </div>
      )}

      {tourneeType === 'fixe' && (
  <div>
    <Label htmlFor="arret">Point d’arrêt</Label>
    <select
      id="arret"
      className="border rounded px-2 py-2 w-full"
      value={pointArretId}
      onChange={(e) => setPointArretId(e.target.value)}
    >
      <option value="">-- Choisir un arrêt --</option>
      {Array.isArray(pointsArret) &&
        pointsArret.map((p, index) => (
          <option key={p.ID || index} value={p.ID}>
            {p.nom || `${p.latitude}, ${p.longitude}`}
          </option>
        ))}
    </select>
  </div>
)}



      <Button 
      type='button'
      onClick={handleAffectation}>Affecter
      
      </Button>
    </div>
  )
}

export default AffectationForm
