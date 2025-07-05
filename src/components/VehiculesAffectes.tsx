import React, { useEffect, useState } from 'react'
import { fetchVehiculesAffectes, retirerAffectationVehiculeConducteur } from '../lib/api'
import { Button } from './ui/button'
import { toast } from 'react-toastify'
import { Trash } from 'lucide-react'

interface Props {
  conducteurId: string
}

const VehiculesAffectes: React.FC<Props> = ({ conducteurId }) => {
  const [vehicules, setVehicules] = useState<any[]>([])

  const chargerVehicules = async () => {
  try {
    const data = await fetchVehiculesAffectes(conducteurId)
    // Filtrer côté client sur date_fin null
    const actifs = data.filter((v: any) => !v.date_fin)
    setVehicules(actifs)
  } catch (e) {
    toast.error('Erreur lors du chargement des véhicules affectés')
  }
}

  useEffect(() => {
    if (conducteurId) chargerVehicules()
  }, [conducteurId])

  const handleSupprimer = async (id: string) => {
    try {
      await retirerAffectationVehiculeConducteur(id)
      toast.success('Affectation véhicule retirée.')
      chargerVehicules()
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de la suppression.')
    }
  }

  return (
    <div className="space-y-2">
      {vehicules.length === 0 && <p>Aucun véhicule affecté.</p>}
      {vehicules.map((v) => (
        <div
          key={v.id}
          className="border p-3 rounded flex justify-between items-center bg-gray-50"
        >
          <div>
            <p className="font-medium">{v.immatriculation}</p>
            <p className="text-sm text-gray-600">{v.marque} {v.modele}</p>
            <p className="text-xs text-gray-500">Capacité : {v.capacite}</p>
          </div>
         <Button
  size="sm"
  variant="ghost"
  onClick={(e) => {
    e.stopPropagation()
    const confirm = window.confirm('Retirer ce véhicule ?')
    if (!confirm) return
    handleSupprimer(v.id)
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

export default VehiculesAffectes
