import { useState } from 'react'
import useFacturationStore from '../../../store/useFacturationStore'
import { Button } from '../../ui/button'
import { Loader2, CheckCheck } from 'lucide-react'

interface Props {
  paiementId: string
  periodeId: string
 
  disabled?: boolean
}

export default function BoutonMarquerEffectue({
  paiementId,
  periodeId,
  disabled = false
}: Props) {
  const [loading, setLoading] = useState(false)
  const marquerPaiementEffectue = useFacturationStore(s => s.marquerPaiementEffectue)

  const handleClick = async () => {
    if (!confirm('Confirmer que ce paiement a été effectué ?')) {
      return
    }

    try {
      setLoading(true)
      await marquerPaiementEffectue(paiementId, periodeId)
      alert('Paiement marqué comme effectué.')
    } catch (err) {
      console.error(err)
      alert('Erreur lors du marquage comme effectué')
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
          Traitement...
        </>
      ) : (
        <>
          <CheckCheck className="h-4 w-4" />
          Marquer comme effectué
        </>
      )}
    </Button>
  )
}