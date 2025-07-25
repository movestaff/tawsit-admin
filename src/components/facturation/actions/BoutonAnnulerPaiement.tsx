import { useState } from 'react'
import useFacturationStore from '../../../store/useFacturationStore'
import { Button } from '../../ui/button'



interface Props {
  paiementId: string
  disabled?: boolean
}

export default function BoutonAnnulerPaiement({ paiementId, disabled }: Props) {
  const annulerPaiement = useFacturationStore(
    (state) => state.annulerPaiement
  )

  const [loading, setLoading] = useState(false)

  const handleClick = async () => {
    if (!confirm('Voulez-vous vraiment annuler ce paiement ? Cette action est irréversible.')) {
    return
    }

    if (!paiementId) {
      alert('Paiement ID manquant.')
      return
    }

    try {
      setLoading(true)
      await annulerPaiement(paiementId)
      alert('Paiement annulé et période rouverte.')
    } catch (err) {
      console.error(err)
      alert('Erreur lors de l’annulation du paiement.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      onClick={handleClick}
      disabled={disabled || loading}
      variant="destructive"
      size="sm"
    >
      {loading ? 'Annulation...' : 'Annuler Paiement'}
    </Button>
  )
} 
