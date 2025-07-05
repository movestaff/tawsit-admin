import StatusBadge from '../StatusBadge'
import type { Paiement } from '../../../types/facturation'
import BoutonValidationPaiement from '../actions/BoutonValidationPaiement'
import BoutonMarquerEffectue from '../actions/BoutonMarquerEffectue'
import BoutonAnnulerPaiement from '../actions/BoutonAnnulerPaiement'

interface Props {
  paiements: Paiement[]
  loading: boolean
  onValider: (id: string) => void
 
}

export default function PaiementTable({
  paiements,
  loading,
 
 
}: Props) {
  if (loading) return <p className="p-4">Chargement des paiements...</p>
  if (!paiements.length) return <p className="p-4">Aucun paiement trouvé.</p>

  return (
    <div className="overflow-x-auto rounded border">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Prestataire</th>
            <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">N° Contrat</th>
            <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Montant</th>
            <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Date de paiement</th>
            <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Période</th>
            <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Statut</th>
            <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {paiements.map((p) => (
            <tr key={p.id} className="hover:bg-gray-50">
              <td className="px-4 py-2">{p.contrats_prestataires?.prestataires?.nom ?? '-'}</td>
              <td className="px-4 py-2">{p.contrats_prestataires?.numero_contrat ?? '-'}</td>
              <td className="px-4 py-2">{p.montant.toFixed(2)} </td>
              <td className="px-4 py-2">{p.date_paiement}</td>
              <td className="px-4 py-2">{p.periodes_facturation?.label ?? '-'}</td>
              <td className="px-4 py-2">
                <StatusBadge statut={p.statut} />
              </td>
              <td className="px-4 py-2 flex gap-2 justify-center items-center">
                {p.statut === 'brouillon' && (
                  <BoutonValidationPaiement paiementId={p.id} />
                )}

            {p.statut === 'validé' && p.periodes_facturation?.id && (
                <BoutonMarquerEffectue
                paiementId={p.id}
            periodeId={p.periodes_facturation.id}
          />
               )}

           {p.statut === 'effectué' && (
                <BoutonAnnulerPaiement paiementId={p.id} />
                )}
</td>

            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
