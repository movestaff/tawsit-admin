import { useState } from 'react'
import useFacturationStore from '../../../store/useFacturationStore'
import { Button } from '../../../components/ui/button'
import { Loader2, Calculator } from 'lucide-react'

interface Props {
  periodeId: string
  disabled?: boolean
}

export default function BoutonCalculMontants({
  periodeId,
  disabled = false
}: Props) {
  const [loading, setLoading] = useState(false)
  const lancerCalculMontants = useFacturationStore(s => s.lancerCalculMontants)

  const handleClick = async () => {
    if (!confirm('Confirmer le lancement du calcul des montants pour cette période ?')) {
      return
    }

    try {
      setLoading(true)
      await lancerCalculMontants(periodeId)
      alert('Calcul terminé.')
    } catch (err) {
      console.error(err)
      alert('Erreur lors du calcul des montants')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      onClick={handleClick}
      disabled={disabled || loading}
      className="flex items-center gap-2"
      variant="outline"
    >
      {loading ? (
        <>
          <Loader2 className="animate-spin h-4 w-4" />
          Calcul en cours...
        </>
      ) : (
        <>
          <Calculator className="h-4 w-4" />
          Lancer calcul
        </>
      )}
    </Button>
  )
}
