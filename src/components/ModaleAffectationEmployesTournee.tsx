import React, { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { ScrollArea } from './ui/scroll-area'
import { Checkbox } from './ui/checkbox'
import { Button } from './ui/button'
import { ajouterAffectation, fetchEmployesNonAffectesParTournee } from '../lib/api'

interface Props {
  tourneeId: string
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export const ModaleAffectationEmployesTournee: React.FC<Props> = ({ tourneeId, open, onClose, onSuccess }) => {
  const [employes, setEmployes] = useState<any[]>([])
  const [selection, setSelection] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open) return
    setSelection(new Set()) // reset
    fetchEmployesNonAffectesParTournee(tourneeId)
      .then(setEmployes)
      .catch(err => console.error('Erreur chargement employés :', err))
  }, [open, tourneeId])

  const toggleSelection = (id: string) => {
    setSelection(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) newSet.delete(id)
      else newSet.add(id)
      return newSet
    })
  }

  const handleAffectation = async () => {
    if (selection.size === 0) return
    setLoading(true)
    try {
      await Promise.all(
        Array.from(selection).map(employeId =>
          ajouterAffectation({
            tournee_id: tourneeId,
            employe_id: employeId,
            type: 'flexible',
          })
        )
      )
      onSuccess()
      onClose()
    } catch (err) {
      console.error('Erreur affectation multiple', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Affecter des employés à la tournée</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-96 border rounded-md mt-4">
          <div className="divide-y">
            {employes.map(emp => (
              <label
                key={emp.ID}
                className="flex items-center justify-between p-3 hover:bg-gray-50 cursor-pointer"
              >
                <div>
                  <div className="font-medium">{emp.prenom} {emp.nom}</div>
                  <div className="text-sm text-gray-500">{emp.email}</div>
                </div>
                <Checkbox
                  checked={selection.has(emp.ID)}
                  onChange={() => toggleSelection(emp.ID)}
                />
              </label>
            ))}
            {employes.length === 0 && (
              <div className="p-4 text-center text-sm text-gray-500">Aucun employé disponible</div>
            )}
          </div>
        </ScrollArea>
        <div className="flex justify-end mt-4 gap-2">
          <Button variant="ghost" onClick={onClose}>Annuler</Button>
          <Button onClick={handleAffectation} disabled={selection.size === 0 || loading}>
            {loading ? 'Affectation...' : `Affecter (${selection.size})`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
