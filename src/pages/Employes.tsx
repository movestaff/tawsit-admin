// ✅ Fichier : src/pages/Employes.tsx
import React, { useEffect, useState } from 'react'
import { fetchEmployes, deleteEmploye } from '../lib/api'
import FormulaireEmploye from '../components/FormulaireEmploye'
import { Dialog, DialogContent } from '../components/ui/dialog'
import { Button } from '../components/ui/button'
import { Pencil, Trash } from 'lucide-react'
import { toast } from 'react-toastify'

function Employes() {
  const [employes, setEmployes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [formVisible, setFormVisible] = useState(false)
  const [selected, setSelected] = useState<any | null>(null)

  const [sortBy, setSortBy] = useState<'nom' | 'prenom' | 'matricule' | 'email' | 'actif'>('nom')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  const chargerEmployes = async () => {
    setLoading(true)
    try {
      const data = await fetchEmployes()
      setEmployes(data)
    } catch (err: any) {
      setError(err.message || 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    chargerEmployes()
  }, [])

  const filteredEmployes = employes.filter((e) => {
    const actifStr = e.actif ? 'actif oui true 1' : 'inactif non false 0'
    const rowStr = `
      ${e.nom || ''}
      ${e.prenom || ''}
      ${e.matricule || ''}
      ${e.email || ''}
      ${actifStr}
    `.toLowerCase()
    return rowStr.includes(search.toLowerCase())
  })

  const handleSort = (col: typeof sortBy) => {
    if (sortBy === col) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(col)
      setSortOrder('asc')
    }
  }

  const sortedEmployes = [...filteredEmployes].sort((a, b) => {
    let valA = a[sortBy]
    let valB = b[sortBy]
    if (sortBy === 'actif') {
      valA = a.actif ? 1 : 0
      valB = b.actif ? 1 : 0
    } else {
      valA = (valA || '').toString().toLowerCase()
      valB = (valB || '').toString().toLowerCase()
    }
    if (valA < valB) return sortOrder === 'asc' ? -1 : 1
    if (valA > valB) return sortOrder === 'asc' ? 1 : -1
    return 0
  })

  const paginatedEmployes = sortedEmployes.slice((page - 1) * rowsPerPage, page * rowsPerPage)

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-primary mb-6">Gestion des employés</h1>

      <div className="flex flex-wrap items-center gap-4 mb-6">
        <input
          type="text"
          placeholder="🔍 Rechercher par nom, prénom, matricule, email, Actif..."
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
          + Ajouter un employé
        </button>
      </div>

      {loading && <p className="text-gray-700">Chargement des employés...</p>}
      {error && <p className="text-red-600 font-medium">Erreur : {error}</p>}

      {!loading && !error && (
        <div className="overflow-x-auto rounded border border-neutral bg-white shadow-card">
          <table className="min-w-full text-sm text-gray-800">
            <thead>
              <tr className="bg-secondary text-left font-semibold text-gray-700">
                <th className="px-4 py-2 cursor-pointer select-none" onClick={() => handleSort('nom')}>
                  Nom {sortBy === 'nom' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                </th>
                <th className="px-4 py-2 cursor-pointer select-none" onClick={() => handleSort('prenom')}>
                  Prénom {sortBy === 'prenom' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                </th>
                <th className="px-4 py-2 cursor-pointer select-none" onClick={() => handleSort('matricule')}>
                  Matricule {sortBy === 'matricule' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                </th>
                <th className="px-4 py-2 cursor-pointer select-none" onClick={() => handleSort('email')}>
                  Email {sortBy === 'email' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                </th>
                <th className="px-4 py-2 cursor-pointer select-none" onClick={() => handleSort('actif')}>
                  Actif {sortBy === 'actif' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                </th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedEmployes.map((e) => (
                <tr
                  key={e.ID}
                  className="border-t hover:bg-secondary/80 cursor-pointer"
                  onDoubleClick={() => {
                    setSelected(e)
                    setFormVisible(true)
                  }}
                >
                  <td className="px-4 py-2">{e.nom}</td>
                  <td className="px-4 py-2">{e.prenom || '—'}</td>
                  <td className="px-4 py-2">{e.matricule}</td>
                  <td className="px-4 py-2">{e.email || '—'}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        e.actif ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {e.actif ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td className="px-4 py-2 flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(ev) => {
                        ev.stopPropagation()
                        setSelected(e)
                        setFormVisible(true)
                      }}
                      title="Modifier"
                    >
                      <Pencil className="w-5 h-5 text-blue-600" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={async (ev) => {
                        ev.stopPropagation()
                        const confirm = window.confirm('Supprimer cet employé ?')
                        if (!confirm) return
                        try {
                          await deleteEmploye(e.ID)
                          toast.success('Employé supprimé.')
                          chargerEmployes()
                        } catch (err: any) {
                          toast.error(err.message || 'Erreur lors de la suppression')
                        }
                      }}
                      title="Supprimer"
                    >
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
                onClick={() =>
                  setPage((p) =>
                    p * rowsPerPage < sortedEmployes.length ? p + 1 : p
                  )
                }
                disabled={page * rowsPerPage >= sortedEmployes.length}
                className="text-sm px-2 py-1 border rounded disabled:opacity-50"
              >
                Suivant ▶
              </button>
            </div>
          </div>

          <p className="text-xs text-gray-500 p-2">
            Total : {sortedEmployes.length} employé(s)
          </p>
        </div>
      )}

      <Dialog open={formVisible} onOpenChange={(open) => {
        setFormVisible(open)
        if (!open) setSelected(null)
      }}>
        <DialogContent className="w-full !max-w-6xl">
          <FormulaireEmploye
            employe={selected}
            onSuccess={() => {
              setFormVisible(false)
              setSelected(null)
              chargerEmployes()
            }}
            onCancel={() => {
              setFormVisible(false)
              setSelected(null)
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Employes
