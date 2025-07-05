import { useEffect, useState } from 'react' 
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog'
import { fetchHistoriqueValidations } from '../../lib/api'
import { Input } from '../ui/input'
import { Button } from '../ui/button'

interface ModalHistoriqueValidationProps {
  open: boolean
  onClose: () => void
  contratId: string
}

export function ModalHistoriqueValidation({ open, onClose, contratId }: ModalHistoriqueValidationProps) {
  const [validations, setValidations] = useState<any[]>([])
  const [filtre, setFiltre] = useState('')
  const [page, setPage] = useState(1)
  const [parPage, setParPage] = useState(10)

  useEffect(() => {
    if (!open) return

    const charger = async () => {
      const data = await fetchHistoriqueValidations(contratId)
      setValidations(data)
    }

    charger()
  }, [open, contratId])

  const validationsFiltres = validations.filter(v => {
    const dateStr = new Date(v.date_action).toLocaleDateString()
    return (
      v.statut?.toLowerCase().includes(filtre.toLowerCase()) ||
      v.commentaire?.toLowerCase().includes(filtre.toLowerCase()) ||
      v.profiles?.display_name?.toLowerCase().includes(filtre.toLowerCase()) ||
      dateStr.includes(filtre)
    )
  })

  const totalPages = Math.ceil(validationsFiltres.length / parPage)
  const validationsPage = validationsFiltres.slice((page - 1) * parPage, page * parPage)

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="!max-w-6xl">
        <DialogHeader>
          <DialogTitle>Historique des validations</DialogTitle>
        </DialogHeader>

        <div className="mb-4">
          <Input
            placeholder="Filtrer par statut, commentaire, utilisateur ou date..."
            value={filtre}
            onChange={e => setFiltre(e.target.value)}
            className="w-1/2"
          />
        </div>

        <div className="overflow-auto max-h-[400px]">
          <table className="w-full text-sm text-left border">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-3 py-2">Statut</th>
                <th className="px-3 py-2">Commentaire</th>
                <th className="px-3 py-2">Utilisateur</th>
                <th className="px-3 py-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {validationsPage.map((val, i) => (
                <tr key={i} className="border-t">
                  <td className="px-3 py-2 font-medium">{val.statut}</td>
                  <td className="px-3 py-2">{val.commentaire || '—'}</td>
                  <td className="px-3 py-2">{val.profiles?.display_name || val.utilisateur_id}</td>
                  <td className="px-3 py-2">{new Date(val.date_action).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-between items-start mt-4">
          <div className="flex items-center gap-2">
            <span className="text-sm">Lignes / page :</span>
            <select
              value={parPage}
              onChange={e => setParPage(Number(e.target.value))}
              className="border border-gray-300 rounded px-2 py-1 text-sm"
            >
              {[5, 10, 20, 50].map(n => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col items-start gap-2">
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => p - 1)}
                disabled={page === 1}
                className="text-sm px-2 py-1 border rounded disabled:opacity-50"
              >
                ◀ Précédent
              </button>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={page === totalPages}
                className="text-sm px-2 py-1 border rounded disabled:opacity-50"
              >
                Suivant ▶
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <Button className="bg-green-600 text-white" onClick={onClose}>Fermer</Button>
        </div>
        <div className="text-sm">Page {page} / {totalPages}</div>
      </DialogContent>
    </Dialog>
  )
}
