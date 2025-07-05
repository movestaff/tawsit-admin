import React, { useEffect, useState } from 'react'
import { fetchGroupesEmployes, deleteGroupeEmployes } from '../lib/api'
import { Pencil, Trash, Users } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog'
import { toast } from 'react-toastify'
import FormulaireGroupeEmploye from '../components/FormulaireGroupeEmploye'
import ModalEmployesDuGroupe from '../components/ModalEmployesDuGroupe'

function GroupeEmployes() {
  const [groupes, setGroupes] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<any | null>(null)
  const [formVisible, setFormVisible] = useState(false)
  const [modalEmployes, setModalEmployes] = useState(false)
  const [sortField, setSortField] = useState('nom')
  const [sortAsc, setSortAsc] = useState(true)
  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  const chargerGroupes = async () => {
    setLoading(true)
    try {
      const data = await fetchGroupesEmployes()
      setGroupes(data)
    } catch (err: any) {
      toast.error(err.message || 'Erreur de chargement')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    chargerGroupes()
  }, [])

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortAsc(!sortAsc)
    } else {
      setSortField(field)
      setSortAsc(true)
    }
  }

  const filteredGroupes = groupes
    .filter((g) => {
      const rowStr = `
        ${g.nom || ''}
        ${g.heure_debut || ''}
        ${g.heure_fin || ''}
        ${g.recurrence_type || ''}
        ${g.type || ''}
        ${g.site_nom || ''}
      `.toLowerCase()
      return rowStr.includes(search.toLowerCase())
    })
    .sort((a, b) => {
      const valA = a[sortField] || ''
      const valB = b[sortField] || ''
      return sortAsc ? String(valA).localeCompare(String(valB)) : String(valB).localeCompare(String(valA))
    })

  const groupesAffiches = filteredGroupes.slice((page - 1) * rowsPerPage, page * rowsPerPage)

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-primary mb-6">Groupes de travail</h1>

      <Dialog open={formVisible} onOpenChange={(open) => {
        setFormVisible(open)
        if (!open) setSelected(null)
      }}>
        <DialogContent className="w-full !max-w-4xl">
          <DialogHeader>
            <DialogTitle>{selected ? 'Modifier le groupe' : 'Créer un groupe'}</DialogTitle>
          </DialogHeader>
          <FormulaireGroupeEmploye
            groupe={selected}
            onSuccess={() => {
              setFormVisible(false)
              setSelected(null)
              chargerGroupes()
            }}
            onCancel={() => {
              setFormVisible(false)
              setSelected(null)
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={modalEmployes} onOpenChange={(open) => setModalEmployes(open)}>
        <DialogContent className="w-full !max-w-5xl">
          <DialogHeader>
            <DialogTitle>Employés affectés au groupe</DialogTitle>
          </DialogHeader>
          {selected && <ModalEmployesDuGroupe groupe={selected} onClose={() => setModalEmployes(false)} />}
        </DialogContent>
      </Dialog>

      <div className="flex flex-wrap items-center gap-4 mb-6">
        <input
          type="text"
          placeholder="🔍 Rechercher groupe..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-2 border border-neutral rounded shadow-sm w-full max-w-md focus:outline-none focus:ring focus:border-primary"
        />
        <button
          className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded font-semibold transition"
          onClick={() => {
            setFormVisible(true)
            setSelected(null)
          }}
        >
          + Nouveau groupe
        </button>
      </div>

      {loading ? (
        <p>Chargement...</p>
      ) : (
        <div className="overflow-x-auto rounded border border-neutral bg-white shadow-card">
          <table className="min-w-full text-sm text-gray-800">
            <thead>
              <tr className="bg-secondary text-left font-semibold text-gray-700">
                {['nom', 'heure_debut', 'heure_fin', 'type', 'recurrence_type', 'site_nom'].map((field) => (
                  <th
                    key={field}
                    className="px-4 py-2 cursor-pointer select-none"
                    onClick={() => handleSort(field)}
                  >
                    {field.charAt(0).toUpperCase() + field.slice(1).replace('_', ' ')} {sortField === field && (sortAsc ? '▲' : '▼')}
                  </th>
                ))}
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {groupesAffiches.map((groupe) => (
                <tr key={groupe.id} className="border-t hover:bg-secondary/80">
                  <td className="px-4 py-2">{groupe.nom}</td>
                  <td className="px-4 py-2">{groupe.heure_debut}</td>
                  <td className="px-4 py-2">{groupe.heure_fin}</td>
                  <td className="px-4 py-2">{groupe.type}</td>
                  <td className="px-4 py-2">{groupe.recurrence_type}</td>
                  <td className="px-4 py-2">{groupe.site_nom}</td>
                  <td className="px-4 py-2 flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => { setSelected(groupe); setFormVisible(true) }}>
                      <Pencil className="w-5 h-5 text-blue-600" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => { setSelected(groupe); setModalEmployes(true) }}>
                      <Users className="w-5 h-5 text-orange-600" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={async () => {
                      if (confirm('Supprimer ce groupe ?')) {
                        try {
                          await deleteGroupeEmployes(groupe.id)
                          toast.success('Groupe supprimé.')
                          chargerGroupes()
                        } catch (err: any) {
                          toast.error(err.message || 'Erreur lors de la suppression')
                        }
                      }
                    }}>
                      <Trash className="w-5 h-5 text-red-600" />
                    </Button>
                  </td>
                </tr>
              ))}
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
                onClick={() => setPage((p) => p * rowsPerPage < filteredGroupes.length ? p + 1 : p)}
                disabled={page * rowsPerPage >= filteredGroupes.length}
                className="text-sm px-2 py-1 border rounded disabled:opacity-50"
              >
                Suivant ▶
              </button>
            </div>
          </div>
          <p className="text-xs text-gray-500 p-2">Total : {filteredGroupes.length} groupe(s)</p>
        </div>
      )}
    </div>
  )
}

export default GroupeEmployes