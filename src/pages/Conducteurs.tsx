// ✅ Fichier : src/pages/Conducteurs.tsx


import React, { useEffect, useState } from 'react'
import { fetchConducteurGestion, deleteConducteur } from '../lib/api'
import FormulaireConducteur from '../components/FormulaireConducteur'
import { Button } from '../components/ui/button'
import { Pencil, Trash } from 'lucide-react'
import { toast } from 'react-toastify'

function Conducteurs() {
  const [conducteurs, setConducteurs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [formVisible, setFormVisible] = useState(false)
  const [selected, setSelected] = useState<any | null>(null)
  const [sortBy, setSortBy] = useState<'nom' | 'prenom' | 'numero_permis' | 'email' | 'statut'>('nom')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  const chargerConducteurs = async () => {
    setLoading(true)
    try {
      const data = await fetchConducteurGestion()
      setConducteurs(data)
    } catch (err: any) {
      setError(err.message || 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    chargerConducteurs()
  }, [])

  const filteredConducteurs = conducteurs.filter((c) => {
    const statutStr = c.statut ? `${c.statut}` : ''
    const rowStr = `
      ${c.nom || ''}
      ${c.prenom || ''}
      ${c.numero_permis || ''}
      ${c.email || ''}
      ${statutStr}
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

  const sortedConducteurs = [...filteredConducteurs].sort((a, b) => {
    let valA = a[sortBy]
    let valB = b[sortBy]
    valA = (valA || '').toString().toLowerCase()
    valB = (valB || '').toString().toLowerCase()
    if (valA < valB) return sortOrder === 'asc' ? -1 : 1
    if (valA > valB) return sortOrder === 'asc' ? 1 : -1
    return 0
  })

  const paginatedConducteurs = sortedConducteurs.slice((page - 1) * rowsPerPage, page * rowsPerPage)

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-primary mb-6">Gestion des conducteurs</h1>

      {formVisible && (
  <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
    <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full p-6 relative">
      <button
        onClick={() => {
          setFormVisible(false)
          setSelected(null)
        }}
        className="absolute top-2 right-2 text-gray-600 hover:text-black text-xl font-bold"
        aria-label="Fermer"
      >
        ×
      </button>
      <FormulaireConducteur
        conducteur={selected}
        onSuccess={async () => {
  await chargerConducteurs()
  const updated = conducteurs.find((c) => c.id === selected?.id)
  setSelected(updated || null)
  setFormVisible(false)
}}
        onCancel={() => {
          setFormVisible(false)
          setSelected(null)
        }}
      />
    </div>
  </div>
)}

      {!formVisible && (
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <input
            type="text"
            placeholder="🔍 Rechercher par nom, prénom, permis, email, statut..."
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
            + Ajouter un conducteur
          </button>
        </div>
      )}

      {loading && <p className="text-gray-700">Chargement des conducteurs...</p>}
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
                <th className="px-4 py-2 cursor-pointer select-none" onClick={() => handleSort('numero_permis')}>
                  Permis {sortBy === 'numero_permis' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                </th>
                <th className="px-4 py-2 cursor-pointer select-none" onClick={() => handleSort('email')}>
                  Email {sortBy === 'email' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                </th>
                <th className="px-4 py-2 cursor-pointer select-none" onClick={() => handleSort('statut')}>
                  Statut {sortBy === 'statut' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                </th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedConducteurs.map((c) => (
                <tr key={c.id} className="border-t hover:bg-secondary/80 cursor-pointer">
                  <td className="px-4 py-2">{c.nom}</td>
                  <td className="px-4 py-2">{c.prenom || '—'}</td>
                  <td className="px-4 py-2">{c.numero_permis}</td>
                  <td className="px-4 py-2">{c.email || '—'}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      c.statut === 'actif'
                        ? 'bg-green-100 text-green-700'
                        : c.statut === 'hors_service'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {c.statut ? c.statut.charAt(0).toUpperCase() + c.statut.slice(1) : '—'}
                    </span>
                  </td>
                  <td className="px-4 py-2 flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelected(c)
                        setFormVisible(true)
                      }}
                      title="Modifier"
                    >
                      <Pencil className="w-5 h-5 text-blue-600" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={async (e) => {
                        e.stopPropagation()
                        const confirm = window.confirm('Supprimer ce conducteur ?')
                        if (!confirm) return
                        try {
                          await deleteConducteur(c.id)
                          toast.success('Conducteur supprimé.')
                          chargerConducteurs()
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
                    p * rowsPerPage < sortedConducteurs.length ? p + 1 : p
                  )
                }
                disabled={page * rowsPerPage >= sortedConducteurs.length}
                className="text-sm px-2 py-1 border rounded disabled:opacity-50"
              >
                Suivant ▶
              </button>
            </div>
          </div>

          <p className="text-xs text-gray-500 p-2">
            Total : {sortedConducteurs.length} conducteur(s)
          </p>
        </div>
      )}
    </div>
  )
}

export default Conducteurs
