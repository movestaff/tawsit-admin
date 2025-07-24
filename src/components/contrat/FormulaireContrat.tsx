import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog'
import { Input } from '../../components/ui/input'
import { Button } from '../../components/ui/button'
import { Switch } from '../../components/ui/switch'
import { createContrat, updateContrat, desactiverContrat, reactiverContrat, submitContrat, demanderModificationContrat, validerContrat, rejeterContrat, genererPeriodesContrat } from '../../lib/api'
import { toast } from 'react-toastify'
import { useUserProfile } from '../../lib/hooks/useUserProfile'





type Prestataire = { id: string; nom: string }
type Contrat = {
  id?: string
  prestataire_id?: string | string
  date_debut?: string
  date_fin?: string
  montant_total?: number | string
  frequence_paiement?: string
  alerte_expiration_days?: number
  statut?: string
  statut_validation?: 'brouillon' | 'en_attente' | 'valide' | 'rejete' | 'modification_en_cours'
  numero_contrat?: string    
  [key: string]: any

}
type FormulaireContratProps = {
  contrat?: Contrat
  onClose: () => void
  prestataires: Prestataire[]
}

export default function FormulaireContrat({ contrat, onClose, prestataires }: FormulaireContratProps) {
  const [form, setForm] = useState<Contrat>({ alerte_expiration_days: 30, statut: 'actif' })
const { profile } = useUserProfile()
  useEffect(() => {
    if (contrat) setForm({ ...{ alerte_expiration_days: 30, statut: 'actif' }, ...contrat })
  }, [contrat])

  const handleChange = (field: string, value: any) => {
    setForm(f => ({ ...f, [field]: value }))
  }

  const handleSave = async () => {
    if (!form.date_debut || !form.date_fin || !form.prestataire_id) {
      toast.error('Veuillez remplir les champs obligatoires');
      return;
    }

    const payload = {
      date_debut: form.date_debut,
      date_fin: form.date_fin,
      montant_total: form.montant_total,
      frequence_paiement: form.frequence_paiement,
      prestataire_id: form.prestataire_id,
      alerte_expiration_days: form.alerte_expiration_days ?? 30,
      statut: form.statut ?? 'actif',
      statut_validation: form.statut_validation ?? 'brouillon',
      numero_contrat: form.numero_contrat,
    };

    try {
if (form.id) {
  await updateContrat(String(form.id), payload);
  toast.success('Contrat mis à jour');
  onClose();
} else {
  const nouveauContrat = await createContrat(payload);
  toast.success('Contrat créé');
  await genererPeriodesContrat(nouveauContrat.id);
  onClose();
}
    } catch (err) {
      console.error('Erreur enregistrement contrat', err);
      toast.error('Erreur lors de l’enregistrement');
    }
  };

  const handleToggleStatut = async (value: boolean) => {
    if (!form.id) return
    if (!value) {
      await desactiverContrat(form.id)
      toast.warning("Le contrat, les véhicules et les tournées associées ont été désactivés.")
      setForm(f => ({ ...f, statut: 'inactif' }))
    } else {
      await reactiverContrat(form.id)
      toast.success("Le contrat, les véhicules et les tournées associées ont été réactivés.")
      setForm(f => ({ ...f, statut: 'actif' }))
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{form.id ? 'Modifier' : 'Nouveau'} contrat</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">

          <div>
            <label className="text-sm font-medium text-gray-700">Numéro du contrat</label>
            <Input
              type="text"
              value={form.numero_contrat || ''}
              onChange={e => handleChange('numero_contrat', e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Prestataire</label>
            <select
              className="w-full border rounded p-2 mt-1"
              value={form.prestataire_id || ''}
              onChange={e => handleChange('prestataire_id', e.target.value)}
            >
              <option value="">-- Sélectionner un prestataire --</option>
              {prestataires.map(p => <option key={p.id} value={p.id}>{p.nom}</option>)}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Date début</label>
            <Input type="date" value={form.date_debut || ''} onChange={e => handleChange('date_debut', e.target.value)} className="mt-1" />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Date fin</label>
            <Input type="date" value={form.date_fin || ''} onChange={e => handleChange('date_fin', e.target.value)} className="mt-1" />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Montant total</label>
            <Input type="number" value={form.montant_total || ''} onChange={e => handleChange('montant_total', e.target.value)} className="mt-1" />
          </div>

          
            <div>
                  <label className="text-sm font-medium text-gray-700">Fréquence paiement</label>
                  <select
                    className="w-full border rounded p-2 mt-1"
                    value={form.frequence_paiement || ''}
                    onChange={e => handleChange('frequence_paiement', e.target.value)}
                  >
                    <option value="">-- Sélectionner --</option>
                    <option value="mensuelle">Mensuelle</option>
                    <option value="bimensuelle">Bimensuelle</option>
                    <option value="hebdomadaire">Hebdomadaire</option>
                  </select>
            </div>

          

          <div>
            <label className="text-sm font-medium text-gray-700">Jours avant alerte expiration</label>
            <Input type="number" value={form.alerte_expiration_days || ''} onChange={e => handleChange('alerte_expiration_days', parseInt(e.target.value))} className="mt-1" />
          </div>

          {form.id && (
            <div className="flex items-center justify-between border p-2 rounded">
              <span>Statut du contrat</span>
              <Switch
                checked={form.statut === 'actif'}
                onChange={handleToggleStatut}
                disabled={form.statut_validation === 'valide'}
                label="Activer le contrat"
              />
            </div>
          )}


                {form.id && ['brouillon', 'rejete'].includes(form.statut_validation || '') &&  (
                  <Button variant="outline" onClick={async () => {
                    try {
                      await submitContrat(form.id!)
                      toast.success("Contrat soumis pour approbation")
                      onClose()
                    } catch (err) {
                      toast.error("Erreur lors de la soumission")
                    }
                  }}>
                    Soumettre pour approbation
                  </Button>
                )}

                {form.id && form.statut_validation === 'valide' && (
                  <Button variant="outline" onClick={async () => {
                    const objet = prompt("Motif de la demande de modification :")
                    if (!objet) return

                    try {
                      await demanderModificationContrat(form.id!, { objet })
                      toast.success("Demande de modification envoyée")
                      onClose()
                    } catch (err) {
                      toast.error("Erreur lors de la demande de modification")
                    }
                  }}>
                    Demander une modification
                  </Button>
                )}



                {form.id && profile?.est_approbateur && ['en_attente', 'modification_en_cours'].includes(form.statut_validation || '') && (
                  <>
                    <Button variant="primary" onClick={async () => {
                      try {
                        await validerContrat(form.id!)
                        toast.success("Contrat validé")
                        onClose()
                      } catch {
                        toast.error("Erreur lors de la validation")
                      }
                    }}>
                      Valider le contrat
                    </Button>

                    <Button variant="destructive" onClick={async () => {
                      const commentaire = prompt("Motif du rejet :")
                      if (!commentaire) return
                      try {
                        await rejeterContrat(form.id!, commentaire)
                        toast.success("Contrat rejeté")
                        onClose()
                      } catch {
                        toast.error("Erreur lors du rejet")
                      }
                    }}>
                      Rejeter
                    </Button>
                  </>
                )}




        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Annuler</Button>
          <Button onClick={handleSave}>Enregistrer</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
