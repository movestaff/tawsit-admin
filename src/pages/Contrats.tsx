import { useState, useEffect } from 'react'
import { LucideEdit, LucideTrash, LucideList, Clock3, FileText } from 'lucide-react'
import { Input } from '../components/ui/input'
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'
import { fetchContrats, deleteContrat, fetchPrestataires } from '../lib/api'
import FormulaireContrat from '../components/contrat/FormulaireContrat'
import ModalServicesContrat from '../components/contrat/ModalServicesContrat'
import { toast } from 'react-toastify'
import { ModalHistoriqueValidation } from '../components/contrat/ModalHistoriqueValidations'
import {ModalRevisionsContrat} from '../components/contrat/ModalRevisionsContrat'
import { Tooltip } from 'react-tooltip'


type Contrat = {
  id: string
  prestataire_id: string
  date_debut: string
  date_fin: string
  montant_total: number
  frequence_paiement: string
  statut: string
  statut_validation?: "brouillon" | "en_attente" | "valide" | "rejete" | "modification_en_cours"
}

type Prestataire = {
  id: string
  nom: string
}

export default function Contrats() {
  const [contrats, setContrats] = useState<Contrat[]>([])
  const [filtre, setFiltre] = useState('')
  const [modalOuverte, setModalOuverte] = useState(false)
  const [contratEnCours, setContratEnCours] = useState<Contrat | null>(null)
  const [modalServicesOuverte, setModalServicesOuverte] = useState(false)
  const [contratPourServices, setContratPourServices] = useState<Contrat | null>(null)
  const [prestataires, setPrestataires] = useState<Prestataire[]>([])
  const [contratHistorique, setContratHistorique] = useState<string | null>(null)
  const [contratRevisions, setContratRevisions] = useState<string | null>(null)

  const chargerContrats = async () => {
    const data = await fetchContrats()
    setContrats(data)
  }

  const chargerPrestataires = async () => {
    const data = await fetchPrestataires()
    setPrestataires(data)
  }

  useEffect(() => {
    chargerContrats()
    chargerPrestataires()
  }, [])

  const handleEdit = (contrat: any) => {
    setContratEnCours(contrat)
    setModalOuverte(true)
  }

  const handleDelete = async (id: string) => {
  if (window.confirm('Supprimer ce contrat ?')) {
    try {
      const res = await deleteContrat(id.toString())
      toast.success(res?.message || 'Contrat supprimé avec succès')
      chargerContrats()
    } catch (err: any) {
      const message = err?.message || err?.response?.data?.error || 'Erreur lors de la suppression'
      if (message.includes('services associés')) {
        toast.error('Ce contrat possède encore des services associés.')
      } else {
        toast.error(message)
      }
    }
  }
}

  function handleShowServices(contrat: any) {
    setContratPourServices(contrat)
    setModalServicesOuverte(true)
  }

  const filtreContrats = contrats.filter(c => {
    const p = prestataires.find(p => p.id === c.prestataire_id)
    const texte = [c.date_debut, c.date_fin, c.montant_total, c.frequence_paiement, c.statut, c.statut_validation, p?.nom].join(' ').toLowerCase()
    return texte.includes(filtre.toLowerCase())
  })


  return (
    <div className="p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-primary mb-6">Gestion des Contrats</h1>
        <Button onClick={() => { setContratEnCours(null); setModalOuverte(true) }}>Nouveau contrat</Button>
      </div>

      <Input placeholder="Recherche..." value={filtre} onChange={e => setFiltre(e.target.value)} className="w-full" />

      <Card>
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-secondary text-left font-semibold text-gray-700">
              <th className="text-left px-3 py-3">Prestataire</th>
              <th className="text-left px-3 py-2">Date début</th>
              <th className="text-left px-4 py-2">Date fin</th>
              <th className="text-left px-4 py-2">Montant</th>
              <th className="text-left px-4 py-2">Fréquence</th>
              <th className="text-left px-4 py-2">Statut</th>
              <th className="text-left px-4 py-2">Validation</th>
              <th className="text-left px-4 py-2">Historique</th>
              <th className="text-left px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtreContrats.map(contrat => {
              const prestataire = prestataires.find(p => p.id === contrat.prestataire_id)
              return (
                <tr key={contrat.id} className="border-t">
                  <td className="text-left px-4 py-2">{prestataire?.nom || '—'}</td>
                  <td className="text-left px-4 py-2">{contrat.date_debut}</td>
                  <td className="text-left px-4 py-2">{contrat.date_fin}</td>
                  <td className="text-left px-4 py-2">{contrat.montant_total}</td>
                  <td className="text-left px-4 py-2">{contrat.frequence_paiement}</td>
                  <td className="text-left px-4 py-2">{contrat.statut}</td>
                  <td className="text-left px-4 py-2">
                    <span className={
                      "px-2 py-1 rounded-full text-xs font-medium " +
                      (contrat.statut_validation === 'valide' ? 'bg-green-100 text-green-700' :
                        contrat.statut_validation === 'brouillon' ? 'bg-gray-100 text-gray-700' :
                          contrat.statut_validation === 'en_attente' ? 'bg-yellow-100 text-yellow-700' :
                            contrat.statut_validation === 'rejete' ? 'bg-red-100 text-red-700' :
                              contrat.statut_validation === 'modification_en_cours' ? 'bg-blue-100 text-blue-700' :
                                '')
                    }>
                      {contrat.statut_validation}
                    </span>
                  </td>
                  <td className="text-left px-4 py-2">
                    <div className="flex gap-2 items-center">
                      <div data-tooltip-id="tooltip-histo" data-tooltip-content="Historique des validations">
                        <Clock3 className="text-gray-500 cursor-pointer" onClick={() => setContratHistorique(contrat.id)} />
                      </div>
                      <div data-tooltip-id="tooltip-rev" data-tooltip-content="Révisions du contrat">
                        <FileText className="text-blue-500 cursor-pointer" onClick={() => setContratRevisions(contrat.id)} />
                      </div>
                    </div>
                  </td>
                 <td className="text-left px-4 py-2">
  <div className="flex gap-2 items-center">
    <div data-tooltip-id="tooltip-edit" data-tooltip-content="Modifier le contrat">
      <LucideEdit className="cursor-pointer text-blue-500" onClick={() => handleEdit(contrat)} />
    </div>
    <div data-tooltip-id="tooltip-services" data-tooltip-content="Voir les services associés">
      <LucideList className="cursor-pointer text-green-500" onClick={() => handleShowServices(contrat)} />
    </div>
    <div data-tooltip-id="tooltip-delete" data-tooltip-content="Supprimer le contrat">
      <LucideTrash className="cursor-pointer text-red-500" onClick={() => handleDelete(contrat.id)} />
    </div>
  </div>
</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </Card>

      {modalOuverte && (
        <FormulaireContrat
          contrat={contratEnCours ?? undefined}
          onClose={() => { setModalOuverte(false); chargerContrats() }}
          prestataires={prestataires}
        />
      )}

      {modalServicesOuverte && (
        <ModalServicesContrat
          contratId={contratPourServices?.id ?? ''}
          open={modalServicesOuverte}
          onClose={() => setModalServicesOuverte(false)}
          statutValidation={contratPourServices?.statut_validation}
        />
      )}

      {contratHistorique && (
        <ModalHistoriqueValidation
          open={!!contratHistorique}
          onClose={() => setContratHistorique(null)}
          contratId={contratHistorique}
        />
      )}

      {contratRevisions && (
        <ModalRevisionsContrat
          open={!!contratRevisions}
          onClose={() => setContratRevisions(null)}
          contratId={contratRevisions}
        />
      )}

      <Tooltip id="tooltip-histo" />
      <Tooltip id="tooltip-rev" />
      <Tooltip id="tooltip-edit" />
<Tooltip id="tooltip-services" />
<Tooltip id="tooltip-delete" />

    </div>
  )
}
