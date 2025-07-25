import clsx from 'clsx'

interface Props {
  statut: string
}

export default function StatusBadge({ statut }: Props) {
  const { color, label } = mapStatutToStyle(statut)

  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
        color
      )}
    >
      {label}
    </span>
  )
}

function mapStatutToStyle(statut: string): { color: string; label: string } {
  switch (statut) {
    // Périodes
    case 'ouverte':
      return { color: 'bg-blue-100 text-blue-800', label: 'Ouverte' }
    case 'calculée':
      return { color: 'bg-yellow-100 text-yellow-800', label: 'Calculée' }
    case 'payée':
      return { color: 'bg-green-100 text-green-800', label: 'Payée' }
    case 'clôturée':
      return { color: 'bg-gray-200 text-gray-800', label: 'Clôturée' }

    // Montants
    case 'provisoire':
      return { color: 'bg-yellow-100 text-yellow-800', label: 'Provisoire' }
    case 'valide':
      return { color: 'bg-green-100 text-green-800', label: 'Validé' }
    case 'payé':
      return { color: 'bg-green-200 text-green-900', label: 'Payé' }

    // Paiements
    case 'brouillon':
      return { color: 'bg-yellow-100 text-yellow-800', label: 'Brouillon' }
    case 'validé':
      return { color: 'bg-green-100 text-green-800', label: 'Validé' }
    case 'effectué':
      return { color: 'bg-green-200 text-green-900', label: 'Effectué' }
    case 'annulé':
      return { color: 'bg-red-100 text-red-800', label: 'Annulé' }

    default:
      return { color: 'bg-gray-100 text-gray-800', label: statut }
  }
}
