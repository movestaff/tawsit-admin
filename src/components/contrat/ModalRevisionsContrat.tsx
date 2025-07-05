import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { fetchRevisionsContrat } from '../../lib/api'
import { Input } from '../ui/input'
import { Button } from '../ui/button'

interface ModalRevisionsContratProps {
  open: boolean
  onClose: () => void
  contratId: string
}

export function ModalRevisionsContrat({ open, onClose, contratId }: ModalRevisionsContratProps) {
  const [revisions, setRevisions] = useState<any[]>([])
  const [filtre, setFiltre] = useState('')
  const [page, setPage] = useState(1)
  const [parPage, setParPage] = useState(10)

  useEffect(() => {
    if (!open) return

    const charger = async () => {
      const data = await fetchRevisionsContrat(contratId)
      setRevisions(data)
    }

    charger()
  }, [open, contratId])

  const filtreLower = filtre.toLowerCase()
  const revisionsFiltres = revisions.filter(r =>
    r.objet?.toLowerCase().includes(filtreLower) ||
    new Date(r.date_revision).toLocaleDateString().includes(filtreLower)
  )

  const totalPages = Math.ceil(revisionsFiltres.length / parPage)
  const revisionsPage = revisionsFiltres.slice((page - 1) * parPage, page * parPage)

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="!max-w-6xl">
        <DialogHeader>
          <DialogTitle>Révisions du contrat</DialogTitle>
        </DialogHeader>

        <div className="mb-4">
          <Input
            placeholder="Filtrer par objet ou date..."
            value={filtre}
            onChange={e => setFiltre(e.target.value)}
            className="w-1/2"
          />
        </div>

        <div className="overflow-auto max-h-[400px]">
          <table className="w-full text-sm text-left border">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-3 py-2">N°</th>
                <th className="px-3 py-2">Objet</th>
                <th className="px-3 py-2">Date</th>
                <th className="px-3 py-2">Document</th>
              </tr>
            </thead>
            <tbody>
              {revisionsPage.map((rev, i) => (
                <tr key={i} className="border-t">
                  <td className="px-3 py-2">{rev.numero_revision}</td>
                  <td className="px-3 py-2">{rev.objet || '—'}</td>
                  <td className="px-3 py-2">{new Date(rev.date_revision).toLocaleDateString()}</td>
                  <td className="px-3 py-2">
                    {rev.fichier_revision_url ? (
                      <a
                        href={rev.fichier_revision_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        Télécharger
                      </a>
                    ) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-between items-center mt-4">
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
        </div>

        <div className="flex justify-end gap-2 mt-2">
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

        <div className="flex justify-end mt-4">
          <Button className="bg-green-600 text-white" onClick={onClose}>Fermer</Button>
        </div>
        <div className="text-sm mt-1">Page {page} / {totalPages}</div>
      </DialogContent>
    </Dialog>
  )
}
