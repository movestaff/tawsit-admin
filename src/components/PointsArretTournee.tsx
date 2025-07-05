import React, { useEffect, useState } from 'react'
import { fetchPointsArretParTournee, deletePointArret } from '../lib/api'
import { Pencil, Trash2 } from 'lucide-react'
import { Button } from './ui/button'

interface Props {
  tourneeId: string
  onEdit?: (point: any) => void
  onUpdated?: () => void
}

const PointsArretTournee: React.FC<Props> = ({ tourneeId, onEdit }) => {
  const [points, setPoints] = useState<any[]>([])

  const chargerPoints = async () => {
    try {
      const data = await fetchPointsArretParTournee(tourneeId)
      setPoints(data)
      console.log('✅ Points chargés:', data)
    } catch (err) {
      console.error('Erreur chargement points d’arrêt:', err)
    }
  }

  useEffect(() => {
    if (tourneeId) chargerPoints()
  }, [tourneeId])

  const handleDelete = async (pointId: string) => {
    console.log('🧪 Suppression pointId reçu:', pointId)
    const confirm = window.confirm('Supprimer ce point d’arrêt ?')
    if (!confirm) return

    try {
      await deletePointArret(pointId)
      chargerPoints()
    } catch (err: any) {
      alert(err.error || err.message || 'Suppression impossible (liaisons existantes ?)')
    }
  }

  return (
    <div className="p-4 border rounded-md bg-gray-50 shadow-sm">
      <h3 className="text-lg font-semibold mb-3">Points d'arrêt</h3>

      

      {points.length === 0 ? (
        <p>Aucun point d’arrêt associé.</p>
      ) : (
        <ul className="space-y-2">
          {points.map((point, index) => (
            <li key={point.ID || `point-${index}`} className="flex justify-between items-center border-b pb-1">
              <span>{point.nom || point.adresse || 'Sans nom'}</span>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  onClick={() => onEdit && onEdit(point)}
                  title="Modifier"
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    if (!point?.ID) {
                      alert("ID du point d'arrêt manquant.")
                      return
                    }
                    handleDelete(point.ID)
                  }}
                  title="Supprimer"
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default PointsArretTournee
