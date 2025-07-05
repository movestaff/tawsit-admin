import React, { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './ui/dialog'
import { Button } from './ui/button'
import { toast } from 'react-toastify'
import { ajouterAffectation, fetchEmployesNonAffectesParTournee } from '../lib/api'

interface Props {
  open: boolean
  onClose: () => void
  onUpdated: () => void
  pointArretId: string
  tourneeId: string
  affectation: any | null
}



export default function ModaleEditionAffectation({
  open,
  onClose,
  onUpdated,
  pointArretId,
  tourneeId
}: Props) {
  const [employes, setEmployes] = useState<any[]>([])
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      fetchEmployesNonAffectesParTournee(tourneeId)
        .then(setEmployes)
        .catch(() => toast.error("Erreur chargement des employés non affectés"))
    }
  }, [open, tourneeId])

  const toggleSelection = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]
    )
  }

  const handleSubmit = async () => {
    if (selectedIds.length === 0) {
      toast.warning("Aucun employé sélectionné")
      return
    }

    setLoading(true)
    try {
      for (const employe_id of selectedIds) {
        const payload = {
          employe_id,
          point_arret_id: pointArretId,
          tournee_id: tourneeId,
          type: "fixe" as "fixe",
        }

        console.log('📤 Envoi payload :', payload)
        await ajouterAffectation(payload)
      }

      toast.success("Affectations enregistrées")
      onUpdated()
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de l’affectation")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Affecter des employés</DialogTitle>
          <DialogDescription>
            Sélectionnez les employés non encore affectés à un point d’arrêt
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-96 overflow-auto border rounded p-2 space-y-2">
          {employes.map((e) => (
            <label key={e.ID} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedIds.includes(e.ID)}
                onChange={() => toggleSelection(e.ID)}
              />
              {e.nom} {e.prenom} — {e.email}
            </label>
          ))}
          {employes.length === 0 && (
            <p className="text-sm text-gray-500">Aucun employé disponible.</p>
          )}
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose}>Annuler</Button>
          <Button onClick={handleSubmit} disabled={loading || selectedIds.length === 0}>
            {loading ? "Affectation..." : "Valider la sélection"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
