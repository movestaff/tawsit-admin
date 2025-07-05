// ListePointsArret.tsx
import React, { useEffect, useState } from 'react'
import { fetchPointsArretParTournee, deletePointArret } from '../lib/api'
import { Button } from '../components/ui/button'
import { toast } from 'react-toastify'
import ModalEditionPointArret from './ModalEditionPointArret'
import ModalEmployesAffectes from './ModalEmployesAffectes'
import ModaleEditionAffectation from './ModalEditionAffectation'
import { Pencil, Trash, Users } from 'lucide-react'

interface Props {
  tourneeId: string
}

const ListePointsArret: React.FC<Props> = ({ tourneeId }) => {
  const [pointsArret, setPointsArret] = useState<any[]>([])
  const [selectedPoint, setSelectedPoint] = useState<any>(null)
  const [openModal, setOpenModal] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [openModalEmployes, setOpenModalEmployes] = useState(false)
  const [pointAffectation, setPointAffectation] = useState<any>(null)
  const [edition, setEdition] = useState<any>(null)

  const fetchPoints = async () => {
    try {
      const res = await fetchPointsArretParTournee(tourneeId)
      const normalises = res.map((p: any) => ({
        ...p,
        id: p.id || p.ID,
      }))
      setPointsArret(normalises)
    } catch (error) {
      console.error("Erreur chargement points d'arrêt:", error)
    }
  }

  useEffect(() => {
    fetchPoints()
  }, [tourneeId, refreshKey])

  const handleOpenModal = (point: any = null) => {
    setSelectedPoint(point)
    setOpenModal(true)
  }

  const handleCloseModal = () => {
    setOpenModal(false)
    setSelectedPoint(null)
    setRefreshKey((prev) => prev + 1)
  }

  const handleDelete = async (pointId: string) => {
    const confirm = window.confirm('Supprimer ce point d\'arrêt ?')
    if (!confirm) return
    try {
      await deletePointArret(pointId)
      toast.success('Point supprimé')
      fetchPoints()
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de la suppression')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold"></h3>
        <Button size="sm" onClick={() => handleOpenModal(null)}>
          + Ajouter
        </Button>
      </div>

      <div className="overflow-x-auto rounded border border-neutral bg-white shadow">
        <table className="min-w-full text-sm text-gray-800">
          <thead className="bg-secondary text-left font-semibold text-gray-700">
            <tr>
              <th className="px-4 py-2">Nom</th>
              <th className="px-4 py-2">Adresse</th>
              <th className="px-4 py-2">Ordre</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pointsArret.map(point => (
              <tr key={point.id} className="border-t hover:bg-gray-100">
                <td className="px-4 py-2">{point.nom}</td>
                <td className="px-4 py-2">{point.adresse}</td>
                <td className="px-4 py-2">{point.ordre}</td>
                <td className="px-4 py-2 flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleOpenModal(point)}
                    title="Modifier"
                  >
                    <Pencil className="w-5 h-5 text-blue-600" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(point.id)}
                    title="Supprimer"
                  >
                    <Trash className="w-5 h-5 text-red-600" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      if (!point?.id) return
                      setPointAffectation(point)
                      setOpenModalEmployes(true)
                    }}
                    title="Voir employés"
                  >
                    <Users className="w-5 h-5 text-gray-700" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {openModal && (
        <ModalEditionPointArret
          pointArret={selectedPoint}
          point={null}
          tourneeId={tourneeId}
          onUpdated={fetchPoints}
          open={openModal}
          onClose={handleCloseModal}
        />
      )}

      {openModalEmployes && pointAffectation && (
        <ModalEmployesAffectes
          open={openModalEmployes}
          pointArretId={pointAffectation.id}
          tourneeId={tourneeId}
          onClose={() => setOpenModalEmployes(false)}
          onEdit={(affectation: any) => setEdition(affectation)}
        />
      )}

      {edition && (
        <ModaleEditionAffectation
          affectation={edition}
          open={!!edition}
          pointArretId={edition.pointArretId || (pointAffectation && pointAffectation.id)}
          onClose={() => setEdition(null)}
          onUpdated={() => {
            setEdition(null)
            setRefreshKey((prev) => prev + 1)
          }}
          tourneeId={tourneeId}
        />
      )}
    </div>
  )
}

export default ListePointsArret
