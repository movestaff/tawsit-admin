import { useEffect, useState } from 'react'
import useFacturationStore from '../../store/useFacturationStore'
import PaiementTable from '../../components/facturation/tables/PaiementTable'
import FiltreParStatut from '../../components/facturation/FiltreParStatut'

export default function PaiementsPage() {
  const [filtre, setFiltre] = useState<string>('')
  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  const {
    paiements,
    paiementsLoading,
    fetchPaiements,
    validerPaiement,
  } = useFacturationStore()

  // Charger la pagination sauvegardée
  useEffect(() => {
    const savedPage = localStorage.getItem('paiements_pagination_page')
    const savedLimit = localStorage.getItem('paiements_pagination_limit')
    if (savedPage) setPage(Number(savedPage))
    if (savedLimit) setRowsPerPage(Number(savedLimit))
  }, [])

  // Sauver la pagination à chaque changement
  useEffect(() => {
    localStorage.setItem('paiements_pagination_page', String(page))
    localStorage.setItem('paiements_pagination_limit', String(rowsPerPage))
  }, [page, rowsPerPage])

  useEffect(() => {
    fetchPaiements()
  }, [fetchPaiements])

  // Filtrer par statut
  const paiementsFiltres = paiements.filter(p =>
    filtre ? p.statut === filtre : true
  )

  const totalFiltres = paiementsFiltres.length
  const paiementsPagines = paiementsFiltres.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  )

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold">Suivi des paiements</h1>

      <FiltreParStatut
        value={filtre}
        options={['brouillon', 'validé', 'effectué', 'annulé']}
        onChange={(value) => {
          setFiltre(value)
          setPage(1) // Reset page au changement de filtre
        }}
        label="Filtrer les paiements"
      />

      <PaiementTable
        paiements={paiementsPagines}
        loading={paiementsLoading}
        onValider={validerPaiement}
      />

      <div className="flex flex-col md:flex-row justify-between items-center gap-2 px-2 py-4 border-t">
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

          <span className="text-sm">
            Page {page} sur {Math.ceil(totalFiltres / rowsPerPage) || 1}
          </span>

          <button
            onClick={() =>
              setPage((p) => (p * rowsPerPage < totalFiltres ? p + 1 : p))
            }
            disabled={page * rowsPerPage >= totalFiltres}
            className="text-sm px-2 py-1 border rounded disabled:opacity-50"
          >
            Suivant ▶
          </button>
        </div>
      </div>

      <p className="text-xs text-gray-500 px-2 pb-2">
        Total : {totalFiltres} paiement(s)
      </p>
    </div>
  )
}
