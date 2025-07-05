import { useState } from 'react'
import useFacturationStore from '../../../store/useFacturationStore'
import { Button } from '../../ui/button'
import { Loader2, CreditCard } from 'lucide-react'

interface Props {
  periodeId: string
  disabled?: boolean
}

export default function BoutonCreationPaiement({
  periodeId,
  disabled = false
}: Props) {
  const [loading, setLoading] = useState(false)
  const creerPaiement = useFacturationStore(s => s.creerPaiement)

  const handleClick = async () => {
    if (!confirm('Créer un paiement pour cette période (tous montants doivent être validés) ?')) {
      return
    }

    try {
      setLoading(true)
      await creerPaiement(periodeId)
      alert('Paiement créé en brouillon.')
    } catch (err) {
      console.error(err)
      alert('Erreur lors de la création du paiement')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      onClick={handleClick}
      disabled={disabled || loading}
      className="flex items-center gap-4"
      variant="outline"
    >
      {loading ? (
        <>
          <Loader2 className="animate-spin h-4 w-4" />
          Création...
        </>
      ) : (
        <>
          <CreditCard className="h-4 w-4" />
          Créer paiement
        </>
      )}
    </Button>
  )
}
