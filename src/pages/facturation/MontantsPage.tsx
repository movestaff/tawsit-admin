import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import useFacturationStore from '../../store/useFacturationStore'
import MontantTable from '../../components/facturation/tables/MontantTable'
import BoutonValidationMontants from '../../components/facturation/actions/BoutonValidationMontants'
import BoutonCreationPaiement from '../../components/facturation/actions/BoutonCreationPaiement'

interface MontantsPageProps {
  periodeId?: string;
}

export default function MontantsPage({ periodeId }: MontantsPageProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  // const [searchParams] = useSearchParams()
  const { montants, montantsLoading, fetchMontants } = useFacturationStore()

  useEffect(() => {
    if (periodeId) {
      fetchMontants(periodeId)
      setSelectedIds([])  // reset sélection au load
    }
  }, [periodeId, fetchMontants])

  const toggleSelection = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id)
        ? prev.filter(i => i !== id)
        : [...prev, id]
    )
  }

  const allSelectable = montants.filter(m => m.statut === 'provisoire')
  const allSelectedValid = selectedIds.every(id =>
    allSelectable.some(m => m.id === id)
  )
  const canValidate = selectedIds.length > 0 && allSelectedValid


  const canCreatePayment = montants.length > 0 && montants.every(m => m.statut === 'valide')

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold">Montants de la période</h1>
      {!periodeId && (
        <p className="text-red-600">⚠️ Aucun ID de période fourni dans l’URL.</p>
      )}

      {periodeId && (
        <>
          <MontantTable
            montants={montants}
            loading={montantsLoading}
            selected={selectedIds}
            onSelect={toggleSelection}
          />

          <div className="flex flex-wrap gap-4 mt-4">
            <BoutonValidationMontants
              selectedIds={selectedIds}
              periodeId={periodeId}
              disabled={!canValidate}
            />
              <BoutonCreationPaiement
                periodeId={periodeId}
                //disabled={!canCreatePayment}
                
              />
          </div>
        </>
      )}
    </div>
  )
}
