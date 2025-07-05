import StatusBadge from '../StatusBadge'
import type { Montant } from '../../../types/facturation'

interface Props {
  montants: Montant[]
  loading: boolean
  selected: string[]
  onSelect: (id: string) => void
}

export default function MontantTable({
  montants,
  loading,
  selected,
  onSelect
}: Props) {
  if (loading) return <p className="p-4">Chargement des montants...</p>
  if (!montants.length) return <p className="p-4">Aucun montant trouvé pour cette période.</p>

  return (
    <div className="overflow-x-auto rounded border">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2"></th>
            <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Prestataire</th>
            <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">N° Contrat</th>
            <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Code Service</th>
            <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Montant TTC</th>
            <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Statut</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {montants.map((m) => (
            <tr key={m.id} className="hover:bg-gray-50">
              <td className="px-4 py-2">
                <input
                  type="checkbox"
                  checked={selected.includes(m.id)}
                  onChange={() => onSelect(m.id)}
                  disabled={m.statut !== 'provisoire'}
                  className="h-4 w-4 text-blue-600"
                />
              </td>
              <td className="px-4 py-2">{m.contrats_prestataires?.prestataires?.nom ?? '-'}</td>
              <td className="px-4 py-2">{m.contrats_prestataires?.numero_contrat ?? '-'}</td>
              <td className="px-4 py-2">{m.services?.code ?? '-'}</td>
              <td className="px-4 py-2">{m.montant_ttc.toFixed(2)} </td>
              <td className="px-4 py-2">
                <StatusBadge statut={m.statut} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
