import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from './ui/dialog'
import { ScrollArea } from './ui/scroll-area'
import { Button } from './ui/button'
import { ajouterAffectation, fetchEmployesNonAffectesParTournee } from '../lib/api'
import { toast } from 'react-toastify'

type ModalAjoutAffectationEmployesProps = {
  tourneeId: string;
  ouvert: boolean;
  onClose: () => void;
  onAffectation?: () => void;
};

type Employe = {
  ID: string;
  nom: string;
  prenom: string;
  email: string;
};

export default function ModalAjoutAffectationEmployes({
  tourneeId,
  ouvert,
  onClose,
  onAffectation,
}: ModalAjoutAffectationEmployesProps) {
  const [employes, setEmployes] = useState<Employe[]>([])
  const [selection, setSelection] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (ouvert && tourneeId) {
      fetchEmployesNonAffectesParTournee(tourneeId)
        .then(setEmployes)
        .catch(() => toast.error("Erreur chargement des employés non affectés"))
    }
  }, [ouvert, tourneeId])

  const toggleSelection = (id: string) => {
    setSelection(prev =>
      prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]
    )
  }

  const handleValider = async () => {
    if (selection.length === 0) {
      toast.warning("Aucun employé sélectionné")
      return
    }

    setLoading(true)
    try {
      for (const employe_id of selection) {
        await ajouterAffectation({
          employe_id,
          tournee_id: tourneeId,
          type: 'flexible',
        })
      }
      toast.success("Affectations enregistrées")
      onAffectation?.()
      onClose()
    } catch (e: any) {
      toast.error(e.message || "Erreur lors de l’affectation")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={ouvert} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Affecter des employés</DialogTitle>
          <DialogDescription>
            Sélectionnez les employés non encore affectés à cette tournée
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-96 overflow-auto border rounded p-2 space-y-2">
          {employes.map(e => (
            <label key={e.ID} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selection.includes(e.ID)}
                onChange={() => toggleSelection(e.ID)}
              />
              {e.nom} {e.prenom} – {e.email}
            </label>
          ))}
          {employes.length === 0 && (
            <p className="text-sm text-gray-500">Aucun employé disponible.</p>
          )}
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose}>Annuler</Button>
          <Button onClick={handleValider} disabled={loading || selection.length === 0}>
            {loading ? "Affectation..." : "Valider la sélection"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
