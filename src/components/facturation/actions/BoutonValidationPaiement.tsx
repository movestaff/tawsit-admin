import { useState } from 'react'
import useFacturationStore from '../../../store/useFacturationStore'
import { Button } from '../../ui/button'
import { Loader2, CheckCircle2 } from 'lucide-react'

interface Props {
  paiementId: string
  disabled?: boolean
}

export default function BoutonValidationPaiement({
  paiementId,
  disabled = false
}: Props) {
  const [loading, setLoading] = useState(false)
  const validerPaiement = useFacturationStore(s => s.validerPaiement)

  const handleClick = async () => {
    if (!confirm('Confirmer la validation de ce paiement ?')) {
      return
    }

    try {
      setLoading(true)
      await validerPaiement(paiementId)
      alert('Paiement validé avec succès.')
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
      disabled={disabled || loading}
      className="flex items-center gap-2"
      variant="primary"
    >
      {loading ? (
        <>
          <Loader2 className="animate-spin h-4 w-4" />
          Validation...
        </>
      ) : (
        <>
          <CheckCircle2 className="h-4 w-4" />
          Valider paiement
        </>
      )}
    </Button>
  )
}
