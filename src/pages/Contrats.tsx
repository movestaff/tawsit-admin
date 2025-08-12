import { useState, useEffect } from 'react'
import { LucideEdit, LucideTrash, LucideList, Clock3, FileText, FileSignature } from 'lucide-react'
import { Input } from '../components/ui/input'
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'
import { fetchContrats, deleteContrat, fetchPrestataires } from '../lib/api'
import FormulaireContrat from '../components/contrat/FormulaireContrat'
import ModalServicesContrat from '../components/contrat/ModalServicesContrat'
import { toast } from 'react-toastify'
import { ModalHistoriqueValidation } from '../components/contrat/ModalHistoriqueValidations'
import { ModalRevisionsContrat } from '../components/contrat/ModalRevisionsContrat'
import { Tooltip } from 'react-tooltip'
import ModalDocumentsContrat from '../components/contrat/ModalDocumentsContrat'
 

type Contrat = {
  id: string
  prestataire_id: string
  date_debut: string
  date_fin: string
  montant_total: number
  frequence_paiement: string
  statut: string
  statut_validation?: "brouillon" | "en_attente" | "valide" | "rejete" | "modification_en_cours"
  numero_contrat?: string  
   alerte_expiration_days?: number 
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
  const [contratPourDocuments, setContratPourDocuments] = useState<Contrat | null>(null)
  const [documentsModalOpen, setDocumentsModalOpen] = useState(false)

  

  // Pagination
  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  const joursRestants = (dateISO: string) =>
  Math.ceil((new Date(dateISO).getTime() - Date.now()) / (1000 * 60 * 60 * 24))

  const chargerContrats = async () => {
    const data = await fetchContrats()
    setContrats(data)

     // ✅ notifications expiration
  data.forEach((c: Contrat) => {
    if (!c?.date_fin) return
    const left = joursRestants(c.date_fin)
    const seuil = c.alerte_expiration_days ?? 0
    if (Number.isFinite(left) && left >= 0 && left <= seuil) {
      // on évite les doublons de toast avec un id stable
      toast.warn(
        `Le contrat ${c.numero_contrat || c.id.slice(0, 8)} expire dans ${left} jour(s).`,
        { toastId: `exp-${c.id}` }
      )
    }
  })
  }

  const chargerPrestataires = async () => {
    const data = await fetchPrestataires()
    setPrestataires(data)
  }

  useEffect(() => {
    chargerContrats()
    chargerPrestataires()
  }, [])

  useEffect(() => {
    const savedPage = localStorage.getItem('pagination_page_contrats')
    const savedLimit = localStorage.getItem('pagination_limit_contrats')
    if (savedPage) setPage(Number(savedPage))
    if (savedLimit) setRowsPerPage(Number(savedLimit))
  }, [])

  useEffect(() => {
    localStorage.setItem('pagination_page_contrats', String(page))
    localStorage.setItem('pagination_limit_contrats', String(rowsPerPage))
  }, [page, rowsPerPage])

  const handleEdit = (contrat: Contrat) => {
    setContratEnCours(contrat)
    setModalOuverte(true)
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Supprimer ce contrat ?')) {
      try {
        const res = await deleteContrat(id)
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

  function handleShowServices(contrat: Contrat) {
    setContratPourServices(contrat)
    setModalServicesOuverte(true)
  }

  const filtreContrats = contrats.filter(c => {
    const p = prestataires.find(p => p.id === c.prestataire_id)
    const texte = [c.date_debut, c.date_fin, c.montant_total, c.frequence_paiement, c.statut, c.statut_validation, p?.nom].join(' ').toLowerCase()
    return texte.includes(filtre.toLowerCase())
  })

  const contratsAffiches = filtreContrats.slice((page - 1) * rowsPerPage, page * rowsPerPage)

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-primary">Gestion des Contrats</h1>
        <Button onClick={() => { setContratEnCours(null); setModalOuverte(true) }}>+ Nouveau contrat</Button>
      </div>

      <Input placeholder="🔍 Rechercher..." value={filtre} onChange={e => setFiltre(e.target.value)} className="w-full mb-4" />

      <Card className="overflow-x-auto rounded border border-neutral bg-white shadow-card">
        <table className="min-w-full text-sm text-gray-800">
          <thead>
            <tr className="bg-secondary text-left font-semibold text-gray-700">
              <th className="px-4 py-2">N° Contrat</th>
              <th className="px-3 py-3">Prestataire</th>
              <th className="px-3 py-2">Date début</th>
              <th className="px-4 py-2">Date fin</th>
              <th className="px-4 py-2">Montant</th>
              <th className="px-4 py-2">Fréquence</th>
              <th className="px-4 py-2">Statut</th>
              <th className="px-4 py-2">Validation</th>
              <th className="px-4 py-2">Historique</th>
              <th className="px-4 py-2">Documents</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {contratsAffiches.map(contrat => {
              const prestataire = prestataires.find(p => p.id === contrat.prestataire_id)
              return (
                <tr key={contrat.id} className="border-t">
                  <td className="px-4 py-2">{contrat.numero_contrat || '—'}</td>
                  <td className="px-4 py-2">{prestataire?.nom || '—'}</td>
                  <td className="px-4 py-2">{contrat.date_debut}</td>

                  <td className="px-4 py-2">
  {contrat.date_fin}
  {(() => {
    const left = joursRestants(contrat.date_fin)
    const seuil = contrat.alerte_expiration_days ?? 0
    if (Number.isFinite(left)) {
      if (left < 0) {
        return (
          <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700">
            Expiré
          </span>
        )
      }
      if (left <= seuil) {
        return (
          <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
            J-{left}
          </span>
        )
      }
    }
    return null
  })()}
</td>
                  <td className="px-4 py-2">{contrat.montant_total}</td>
                  <td className="px-4 py-2">{contrat.frequence_paiement}</td>
                  <td className="px-4 py-2">{contrat.statut}</td>
                  <td className="px-4 py-2">
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
                  <td className="px-4 py-2">
                    <div className="flex gap-2 items-center">
                      <Clock3 className="text-gray-500 cursor-pointer" onClick={() => setContratHistorique(contrat.id)} />
                      <FileText className="text-blue-500 cursor-pointer" onClick={() => setContratRevisions(contrat.id)} />
                      
                    </div>
                  </td>
                    <td className="px-4 py-2">
                      <div className="flex gap-2 items-center">
                         <FileSignature
                      
                        className="cursor-pointer text-purple-500"
                        onClick={() => {
                          setContratPourDocuments(contrat)
                          setDocumentsModalOpen(true)
                        }}
                          />
                      </div>
                    </td>

                  <td className="px-4 py-2">
                    <div className="flex gap-2 items-center">
                      <LucideEdit className="cursor-pointer text-blue-500" onClick={() => handleEdit(contrat)} />
                      <LucideList className="cursor-pointer text-green-500" onClick={() => handleShowServices(contrat)} />
                      <LucideTrash className="cursor-pointer text-red-500" onClick={() => handleDelete(contrat.id)} />
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        <div className="flex justify-between items-center p-4">
          <div className="flex items-center gap-2">
            <label className="text-sm">Lignes par page :</label>
            <select
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value))
                setPage(1)
              }}
              className="border px-2 py-1 rounded text-sm"
            >
              {[5, 10, 20, 50].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="text-sm px-2 py-1 border rounded disabled:opacity-50"
            >
              ◀ Précédent
            </button>
            <span className="text-sm">Page {page}</span>
            <button
              onClick={() =>
                setPage((p) =>
                  p * rowsPerPage < filtreContrats.length ? p + 1 : p
                )
              }
              disabled={page * rowsPerPage >= filtreContrats.length}
              className="text-sm px-2 py-1 border rounded disabled:opacity-50"
            >
              Suivant ▶
            </button>
          </div>
        </div>
        <p className="text-xs text-gray-500 p-2">Total : {filtreContrats.length} contrat(s)</p>
      </Card>

      {modalOuverte && (
        <FormulaireContrat
          contrat={contratEnCours ?? undefined}
          onClose={() => { setModalOuverte(false); chargerContrats() }}
          prestataires={prestataires}
        />
      )}

      {modalServicesOuverte && contratPourServices && (
        <ModalServicesContrat
          contratId={contratPourServices.id}
          open={modalServicesOuverte}
          onClose={() => setModalServicesOuverte(false)}
          statutValidation={contratPourServices.statut_validation ?? 'brouillon'}
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

      {contratPourDocuments && (
        <ModalDocumentsContrat
          open={documentsModalOpen}
          onClose={() => setDocumentsModalOpen(false)}
          contrat={{
            id: contratPourDocuments.id,
            statut_validation: contratPourDocuments.statut_validation ?? 'brouillon'
          }}
        />
      )}

      <Tooltip id="tooltip-histo" />
      <Tooltip id="tooltip-rev" />
      <Tooltip id="tooltip-edit" />
      <Tooltip id="tooltip-services" />
      <Tooltip id="tooltip-delete" />
      <Tooltip id="tooltip-docs" />
    </div>
  )
}
