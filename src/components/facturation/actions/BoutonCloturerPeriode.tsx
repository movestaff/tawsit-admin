import { useState } from 'react'
import useFacturationStore from '../../../store/useFacturationStore'
import { Button } from '../../ui/button'
import { Loader2, Lock } from 'lucide-react'

interface Props {
  periodeId: string
  disabled?: boolean
}

export default function BoutonCloturerPeriode({
  periodeId,
  disabled = false
}: Props) {
  const [loading, setLoading] = useState(false)
  const cloturerPeriode = useFacturationStore(s => s.cloturerPeriode)

  const handleClick = async () => {
    if (!confirm('Confirmer la clôture définitive de cette période ?')) {
      return
    }

    try {
      setLoading(true)
      await cloturerPeriode(periodeId)
      alert('Période clôturée avec succès.')
    } catch (err) {
      console.error(err)
      alert('Erreur lors de la clôture')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      onClick={handleClick}
      disabled={disabled || loading}
      className="flex items-center gap-2"
      variant="destructive"
    >
      {loading ? (
        <>
          <Loader2 className="animate-spin h-4 w-4" />
          Clôture...
        </>
      ) : (
        <>
          <Lock className="h-4 w-4" />
          Clôturer période
        </>
      )}
    </Button>
  )
}
