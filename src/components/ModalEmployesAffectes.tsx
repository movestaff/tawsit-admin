import React, { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './ui/dialog'
import { fetchEmployesAffectesParPointArret, retirerAffectation } from '../lib/api'
import { Button } from './ui/button'
import { toast } from 'react-toastify'
import ModaleEditionAffectation from './ModalEditionAffectation'
import { Trash2 } from 'lucide-react' // ✅ Icône cohérente

interface Props {
  pointArretId: string
  tourneeId: string
  open: boolean
  onClose: () => void
  onEdit: (affectation: any) => void
}

export default function ModalEmployesAffectes({ pointArretId, tourneeId, open, onClose }: Props) {
  const [affectations, setAffectations] = useState<any[]>([])
  const [ouvrirModaleAjout, setOuvrirModaleAjout] = useState(false)

  const reloadAffectations = () => {
    fetchEmployesAffectesParPointArret(pointArretId)
      .then(setAffectations)
      .catch(() => toast.error("Erreur lors du chargement des affectations"))
  }

  useEffect(() => {
    if (open && pointArretId) {
      console.log('📡 Chargement des affectations pour:', pointArretId)
      reloadAffectations()
    }
  }, [open, pointArretId])

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cette affectation ?')) return
    try {
      await retirerAffectation(id, 'fixe')
      toast.success('Affectation supprimée')
      reloadAffectations()
    } catch (e: any) {
      toast.error(e.message)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle>Employés affectés</DialogTitle>
          <DialogDescription>Liste des employés affectés à ce point d’arrêt</DialogDescription>
        </DialogHeader>

        <div className="flex justify-end mb-2">
          <Button onClick={() => setOuvrirModaleAjout(true)}>+ Ajouter</Button>
        </div>

        <table className="min-w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left px-3 py-2">Nom</th>
              <th className="text-left px-3 py-2">Email</th>
              <th className="px-3 py-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {affectations.map(a => (
              <tr key={a.id} className="border-t">
                <td className="px-3 py-2">{a.employe.nom} {a.employe.prenom}</td>
                <td className="px-3 py-2">{a.employe.email}</td>
                <td className="px-3 py-2 text-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(a.id)}
                  >
                    <Trash2 className="w-5 h-5 text-red-600" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {ouvrirModaleAjout && (
          <ModaleEditionAffectation
            open={ouvrirModaleAjout}
            pointArretId={pointArretId}
            tourneeId={tourneeId}
            affectation={null}
            onClose={() => setOuvrirModaleAjout(false)}
            onUpdated={() => {
              setOuvrirModaleAjout(false)
              reloadAffectations()
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
