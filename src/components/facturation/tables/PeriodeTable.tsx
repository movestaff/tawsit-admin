import StatusBadge from '../StatusBadge'
import BoutonCalculMontants from '../actions/BoutonCalculMontants'
import BoutonCloturerPeriode from '../actions/BoutonCloturerPeriode'
import { Button } from '../../ui/button'
import type { Periode } from '../../../types/facturation'

interface Props {
  periodes: Periode[]
  loading: boolean
  onLancerCalcul: (id: string) => void
  onCloturer: (id: string) => void
  onVoirMontants: (periode: Periode) => void
}

export default function PeriodeTable({
  periodes,
  loading,
  //onLancerCalcul,
  //onCloturer,
  onVoirMontants
}: Props) {
  if (loading) return <p className="p-4">Chargement des périodes...</p>
  if (!periodes.length) return <p className="p-4">Aucune période trouvée.</p>

  return (
    <div className="overflow-x-auto rounded border">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
  <tr>
    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Label</th>
    
    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">N° Contrat</th>
    
    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Prestataire</th>
    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Dates</th>
    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Statut</th>
    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Actions</th>
  </tr>
</thead>
        <tbody className="divide-y divide-gray-100">
          {periodes.map((p) => (
            <tr key={p.id} className="hover:bg-gray-50">
              <td className="px-4 py-2">{p.label}</td>
                <td className="px-4 py-2">{p.contrat?.numero_contrat || '—'}</td>
      <td className="px-4 py-2">{p.contrat?.prestataire?.nom || '—'}</td>
              <td className="px-4 py-2">
                {p.date_debut} ➜ {p.date_fin}
              </td>
              <td className="px-4 py-2">
                <StatusBadge statut={p.statut} />
              </td>
              <td className="px-4 py-2 flex flex-wrap gap-2">
                {p.statut === 'ouverte' && (
                  <BoutonCalculMontants periodeId={p.id} />
                )}
                {p.statut === 'payée' && (
                  <BoutonCloturerPeriode periodeId={p.id} />
                )}
                <Button
                  onClick={() => onVoirMontants(p)}
                  variant="outline"
                  size="sm"
                >
                  Voir montants
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
