import React, { useEffect, useState } from 'react'
import { ScrollArea } from './ui/scroll-area'
import { Button } from './ui/button'
import { Trash2, Plus } from 'lucide-react'
import { retirerAffectation, getEmployesAffectesParTournee } from '../lib/api'
import ModalAjoutAffectationEmployes from './ModalAjoutAffectationEmployes'

interface Props {
  tourneeId: string
  onRefresh?: () => void
  onClose: () => void
}

const ListeEmployesAffectesTournee: React.FC<Props> = ({ tourneeId, onRefresh }) => {
  const [affectations, setAffectations] = useState<any[]>([])
  const [showAjoutModal, setShowAjoutModal] = useState(false)

  const chargerAffectations = async () => {
    try {
      const data = await getEmployesAffectesParTournee(tourneeId)
      setAffectations(data || [])
    } catch (err) {
      console.error('Erreur chargement affectations:', err)
    }
  }

  const handleSuppression = async (id: string) => {
    try {
      await retirerAffectation(id, 'flexible')
      await chargerAffectations()
      onRefresh?.()
    } catch (err) {
      console.error('Erreur suppression affectation:', err)
    }
  }

  useEffect(() => {
    if (tourneeId) chargerAffectations()
  }, [tourneeId])

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold"></h3>
        <Button variant="outline" size="sm" onClick={() => setShowAjoutModal(true)}>
          <Plus className="w-4 h-4 mr-1" /> Ajouter des employés
        </Button>
      </div>

      <ScrollArea className="h-72 border rounded-md p-2">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-1">Nom</th>
              <th className="text-left py-1">Prénom</th>
              <th className="text-left py-1">Email</th>
              <th className="text-center py-1">Actions</th>
            </tr>
          </thead>
          <tbody>
            {affectations.map((aff) => (
              <tr key={aff.id} className="border-b hover:bg-gray-50">
                <td className="py-1">{aff.employe.nom}</td>
                <td className="py-1">{aff.employe.prenom}</td>
                <td className="py-1">{aff.employe.email}</td>
                <td className="py-1 text-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSuppression(aff.id)}
                  >
                    <Trash2 className="w-5 h-5 text-red-600" />
                  </Button>
                </td>
              </tr>
            ))}
            {affectations.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center text-muted-foreground py-4">
                  Aucun employé affecté pour cette tournée.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </ScrollArea>

      {showAjoutModal && (
        <ModalAjoutAffectationEmployes
          tourneeId={tourneeId}
          ouvert={showAjoutModal}
          onClose={() => {
            setShowAjoutModal(false)
            chargerAffectations()
            onRefresh?.()
          }}
        />
      )}
    </div>
  )
}

export default ListeEmployesAffectesTournee
