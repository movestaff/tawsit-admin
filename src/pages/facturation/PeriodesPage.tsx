import { useEffect, useState } from 'react'
import useFacturationStore from '../../store/useFacturationStore'
import PeriodeTable from '../../components/facturation/tables/PeriodeTable'
import FiltreParStatut from '../../components/facturation/FiltreParStatut'
import type { Periode } from '../../types/facturation'

interface Props {
  onVoirMontants: (periode: Periode) => void
}

export default function PeriodesPage({ onVoirMontants }: Props) {
  const [filtre, setFiltre] = useState<string>('')
  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  // Charger pagination depuis localStorage
  useEffect(() => {
    const savedPage = localStorage.getItem('periodes_pagination_page')
    const savedLimit = localStorage.getItem('periodes_pagination_limit')
    if (savedPage) setPage(Number(savedPage))
    if (savedLimit) setRowsPerPage(Number(savedLimit))
  }, [])

  // Sauver pagination dans localStorage
  useEffect(() => {
    localStorage.setItem('periodes_pagination_page', String(page))
    localStorage.setItem('periodes_pagination_limit', String(rowsPerPage))
  }, [page, rowsPerPage])

  const {
    periodes,
    periodesLoading,
    fetchPeriodes,
    lancerCalculMontants,
    cloturerPeriode
  } = useFacturationStore()

  useEffect(() => {
    fetchPeriodes()
  }, [fetchPeriodes])

  // Appliquer filtre sur statut
  const periodesFiltrees = periodes.filter(p =>
    filtre ? p.statut === filtre : true
  )

  const totalFiltrees = periodesFiltrees.length
  const paginated = periodesFiltrees.slice((page - 1) * rowsPerPage, page * rowsPerPage)

  return (
    <div className="space-y-4">
      <FiltreParStatut
        value={filtre}
        options={['ouverte', 'calculée', 'payée', 'clôturée']}
        onChange={(value) => {
          setFiltre(value)
          setPage(1) // Reset page quand on change le filtre
        }}
        label="Filtrer les périodes"
      />

      <PeriodeTable
        periodes={paginated}
        loading={periodesLoading}
        onLancerCalcul={lancerCalculMontants}
        onCloturer={cloturerPeriode}
        onVoirMontants={onVoirMontants}
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
            Page {page} sur {Math.ceil(totalFiltrees / rowsPerPage) || 1}
          </span>

          <button
            onClick={() =>
              setPage((p) => (p * rowsPerPage < totalFiltrees ? p + 1 : p))
            }
            disabled={page * rowsPerPage >= totalFiltrees}
            className="text-sm px-2 py-1 border rounded disabled:opacity-50"
          >
            Suivant ▶
          </button>
        </div>
      </div>

      <p className="text-xs text-gray-500 px-2 pb-2">
        Total : {totalFiltrees} période(s)
      </p>
    </div>
  )
}
