import React, { useEffect, useState } from 'react'
import { fetchTourneesParConducteur, retirerTourneeConducteur } from '../lib/api'
import { Button } from './ui/button'
import { toast } from 'react-toastify'
import { Trash } from 'lucide-react'

interface Props {
  conducteurId: string
}

const AffectationsConducteur: React.FC<Props> = ({ conducteurId }) => {
  const [affectations, setAffectations] = useState<any[]>([])

  const chargerAffectations = async () => {
    try {
      console.log("Conducteur ID utilisé:", conducteurId)
      const data = await fetchTourneesParConducteur(conducteurId)
      console.log("Tournees reçues du backend:", data)
      setAffectations(data)
    } catch (e) {
      toast.error('Erreur lors du chargement des tournées affectées')
    }
  }

  useEffect(() => {
    if (conducteurId) chargerAffectations()
  }, [conducteurId])

  const handleSupprimer = async (tourneeId: string) => {
    try {
      await retirerTourneeConducteur(tourneeId)
      toast.success('Tournée retirée.')
      chargerAffectations()
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de la suppression.')
    }
  }

  return (
    <div className="space-y-2">
      {affectations.length === 0 && <p>Aucune tournée affectée.</p>}
      {affectations.map((a) => (
        <div
          key={a.id}
          className="border p-3 rounded flex justify-between items-center bg-gray-50"
        >
          <div>
            <p className="font-medium">{a.nom || a.adresse}</p>
            <p className="text-sm text-gray-600">{a.date} | Départ : {a.hr_depart_prevu}</p>
          </div>
          <Button
  size="sm"
  variant="ghost"
  onClick={(e) => {
    e.stopPropagation()
    const confirm = window.confirm('Retirer cette tournée ?')
    if (!confirm) return
    handleSupprimer(a.id)
  }}
  title="Retirer"
>
  <Trash className="w-5 h-5 text-red-600" />
</Button>
        </div>
      ))}
    </div>
  )
}

export default AffectationsConducteur
