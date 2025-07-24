import React, { useEffect, useState } from 'react'
import { retirerAffectation, fetchAffectationsEmploye } from '../lib/api'
import { Button } from './ui/button'
import { toast } from 'react-toastify'
import { Trash } from 'lucide-react'

interface Props {
  employeId: string
  readonly?: boolean
}

const AffectationsEmploye: React.FC<Props> = ({ employeId, readonly }) => {
  console.log('✅ AffectationsEmploye monté')
  const [affectations, setAffectations] = useState<any[]>([])

  const chargerAffectations = async () => {
    try {
      const data = await fetchAffectationsEmploye(employeId)

      const fixes = (data.fixes || []).map((a: any) => ({
        id: a.id,
        type: 'fixe',
        nomTournee: a.point_arret?.tournee?.nom || '',
        nomPointArret: a.point_arret?.nom || '',
      }))

      const flexibles = (data.flexibles || []).map((a: any) => ({
        id: a.id,
        type: 'flexible',
        nomTournee: a.tournees?.nom || '',
        ordre: a.ordre_embarquement,
      }))

      setAffectations([...fixes, ...flexibles])
    } catch (e) {
      toast.error('Erreur lors du chargement des affectations')
    }
  }

  useEffect(() => {
    if (employeId) chargerAffectations()
  }, [employeId])

  const handleSupprimer = async (id: string, type: 'fixe' | 'flexible') => {
    console.log('🧪 Suppression demandée → ID:', id, 'Type:', type)

    try {
      await retirerAffectation(id, type)
      toast.success('Affectation retirée.')
      chargerAffectations()
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de la suppression.')
    }
  }

  return (
    <div className="space-y-2">
      {affectations.length === 0 && <p>Aucune affectation trouvée.</p>}

      {affectations.map((a) => (
        <div
          key={a.id}
          className="border p-3 rounded flex justify-between items-center bg-gray-50"
        >
          <div>
            <p className="font-medium">{a.nomTournee}</p>
            {a.type === 'fixe' && <p className="text-sm text-gray-600">Arrêt : {a.nomPointArret}</p>}
            {a.type === 'flexible' && (
              <p className="text-sm text-gray-600">Ordre : {a.ordre}</p>
            )}
          </div>
         
         {!readonly && (
          <Button
         
            variant="ghost"
            size='sm'
            onClick={() => handleSupprimer(a.id, a.type)}
          >
            <Trash className="w-5 h-5 text-red-600" />
          </Button>
          )}
        </div>
      ))}
    </div>
  )
}

export default AffectationsEmploye
