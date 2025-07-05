import { useState } from 'react'
import useFacturationStore from '../../../store/useFacturationStore'
import { Button } from '../../ui/button'
import { Loader2, CheckCircle } from 'lucide-react'

interface Props {
  selectedIds: string[]
  periodeId: string
  disabled?: boolean
}

export default function BoutonValidationMontants({
  selectedIds,
  periodeId,
  disabled = false
}: Props) {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const validerMontants = useFacturationStore(s => s.validerMontants)

  const handleClick = async () => {
    if (selectedIds.length === 0) return

    if (!confirm(`Confirmer la validation de ${selectedIds.length} montants ?`)) {
      return
    }

    try {
      setLoading(true)
      await validerMontants(selectedIds, periodeId)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      console.error(err)
      alert('Erreur lors de la validation')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      onClick={handleClick}
      disabled={disabled || loading || selectedIds.length === 0}
      className="flex items-center gap-4"
    >
      {loading && <Loader2 className="animate-spin h-4 w-4" />}
      {success && <CheckCircle className="h-4 w-4 text-green-500" />}
      {!loading && !success && <span>Valider sélectionnés</span>}
      {loading && <span>Validation...</span>}
      {success && <span>Validé !</span>}
    </Button>
  )
}
