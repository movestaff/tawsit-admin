// ✅ src/pages/Tournees.tsx
// ✅ Mise à jour de la page Tournees.tsx avec la nouvelle charte graphique Tailwind CSS
// Fichier : src/pages/Tournees.tsx

import React, { useEffect, useState } from 'react'
import { fetchTournees, fetchConducteurs } from '../lib/api'
import FormulaireTournee from '../components/FormulaireTournee'

function Tournees() {
const [tournees, setTournees] = useState<any[]>([])
const [loading, setLoading] = useState(true)
const [error, setError] = useState('')
const [search, setSearch] = useState('')
const [sortField, setSortField] = useState('nom')
const [sortAsc, setSortAsc] = useState(true)
const [formVisible, setFormVisible] = useState(false)
const [selected, setSelected] = useState<any | null>(null)
const [conducteurs, setConducteurs] = useState<any[]>([])

const chargerTournees = async () => {
setLoading(true)
try {
const data = await fetchTournees()
setTournees(data)
} catch (err: any) {
setError(err.message || 'Erreur inconnue')
} finally {
setLoading(false)
}
}

useEffect(() => {
chargerTournees()
}, [])

useEffect(() => {
const chargerConducteurs = async () => {
try {
const data = await fetchConducteurs()
setConducteurs(data)
} catch (e) {
console.error('❌ Erreur chargement conducteurs', e)
}
}
chargerConducteurs()
}, [])

const handleSort = (field: string) => {
if (sortField === field) {
setSortAsc(!sortAsc)
} else {
setSortField(field)
setSortAsc(true)
}
}

const filteredTournees = tournees
.filter((t) =>
`${t.nom} ${t.type} ${t.adresse ?? ''} ${t.hr_depart_prevu ?? ''} ${t.hr_arrivee_prevu ?? ''}`
  .toLowerCase()
  .includes(search.toLowerCase())
)
.sort((a, b) => {
const valA = a[sortField] || ''
const valB = b[sortField] || ''
return sortAsc
? String(valA).localeCompare(String(valB))
: String(valB).localeCompare(String(valA))
})

return (
<div className="p-6">
<h1 className="text-2xl font-bold text-primary mb-6">Gestion des tournées</h1>

  <div className="flex flex-wrap items-center gap-4 mb-6">
    <input
      type="text"
      placeholder="🔍 Rechercher par nom, type, adresse, heure..."
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
      + Nouvelle tournée
    </button>
  </div>

  {formVisible && (
    <div className="mb-6 border rounded p-4 bg-secondary shadow-card transition-all duration-300">
      <FormulaireTournee
        tournee={selected}
        conducteurs={conducteurs}
        onSuccess={() => {
          setFormVisible(false)
          chargerTournees()
          setSelected(null)
        }}
        onCancel={() => {
          setFormVisible(false)
          setSelected(null)
        }}
      />
    </div>
  )}

  {loading && <p className="text-gray-700">Chargement des tournées...</p>}
  {error && <p className="text-red-600 font-medium">Erreur : {error}</p>}

  {!loading && !error && (
    <div className="overflow-x-auto rounded border border-neutral bg-white shadow-card">
      <table className="min-w-full text-sm text-gray-800">
        <thead>
          <tr className="bg-secondary text-left font-semibold text-gray-700">
            {['nom', 'type', 'adresse', 'hr_depart_prevu', 'hr_arrivee_prevu', 'statut'].map((field) => (
              <th
                key={field}
                className="px-4 py-2 cursor-pointer select-none"
                onClick={() => handleSort(field)}
              >
                {field.replace(/_/g, ' ')} {sortField === field && (sortAsc ? '▲' : '▼')}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filteredTournees.map((t) => (
            <tr
              key={t.id}
              className={`border-t hover:bg-secondary/80 cursor-pointer ${
                selected?.id === t.id ? 'bg-accent/10' : ''
              }`}
              onDoubleClick={() => {
                setSelected(t)
                setFormVisible(true)
              }}
            >
              <td className="px-4 py-2">{t.nom}</td>
              <td className="px-4 py-2">{t.type}</td>
              <td className="px-4 py-2">{t.adresse || '—'}</td>
              <td className="px-4 py-2">{t.hr_depart_prevu || '—'}</td>
              <td className="px-4 py-2">{t.hr_arrivee_prevu || '—'}</td>
              <td className="px-4 py-2">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    t.statut ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}
                >
                  {t.statut ? 'Active' : 'Inactive'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="text-xs text-gray-500 p-2">
        Total : {filteredTournees.length} tournée(s)
      </p>
    </div>
  )}
</div>

)
}

export default Tournees