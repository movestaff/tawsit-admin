import React from 'react'
import { Button } from './ui/button'
import { Pencil, Copy, Trash } from 'lucide-react'

interface Props {
  planifications: any[]
  onEdit: (planification: any) => void
  onDuplicate: (planification: any) => void
  onDelete: (planificationId: string) => void
  onRefresh: () => void
  filtreTexte: string
  filtreType?: string
  filtreStatut?: string
}

const ListePlanifications: React.FC<Props> = ({ planifications, onEdit, onRefresh, onDuplicate, onDelete, filtreTexte, filtreType, filtreStatut }) => {
  const texte = (filtreTexte ?? '').toLowerCase()
  const type = (filtreType ?? '').toLowerCase()
  const statut = (filtreStatut ?? '').toLowerCase()

  const planFiltres = planifications.filter(plan => {
    try {
      const nom = plan?.tournee?.nom?.toLowerCase?.() || ''
      const recurrence = plan?.recurrence_type?.toLowerCase?.() || ''
      const date = plan?.date_unique?.toLowerCase?.() || ''
      const js = Array.isArray(plan?.jours_semaine) ? plan.jours_semaine.join(', ').toLowerCase() : ''
      const jm = Array.isArray(plan?.jours_mois) ? plan.jours_mois.join(', ').toLowerCase() : ''
      const dep = plan?.heure_depart?.toLowerCase?.() || ''
      const arr = plan?.heure_arrivee?.toLowerCase?.() || ''
      const actif = plan?.active ? 'active' : 'inactive'

      const matchTexte = texte === '' || (
        nom.includes(texte) ||
        recurrence.includes(texte) ||
        date.includes(texte) ||
        js.includes(texte) ||
        jm.includes(texte) ||
        dep.includes(texte) ||
        arr.includes(texte) ||
        actif.includes(texte)
      )

      const matchType = !type || recurrence === type
      const matchStatut = !statut || actif === statut

      return matchTexte && matchType && matchStatut
    } catch {
      return false
    }
  })

  return (
    <div className="overflow-x-auto bg-white shadow rounded-lg">
      <table className="min-w-full text-sm text-left">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2">Tournée</th>
            <th className="px-4 py-2">Conducteur</th>
            <th className="px-4 py-2">Type</th>
            <th className="px-4 py-2">Départ</th>
            <th className="px-4 py-2">Arrivée</th>
            <th className="px-4 py-2">Statut</th>
            <th className="px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {planFiltres.map((plan) => (
            <tr key={plan.id} className="border-b hover:bg-gray-50">
              <td className="px-4 py-2">{plan.tournee?.nom || '-'}</td>
              <td className="px-4 py-2">{plan.tournee?.profils?.display_name || '-'}
</td>
              <td className="px-4 py-2 capitalize">
                {plan.recurrence_type === 'unique' && `Unique (${plan.date_unique})`}
                {plan.recurrence_type === 'hebdomadaire' && `Hebdo (${plan.jours_semaine?.join(', ')})`}
                {plan.recurrence_type === 'mensuelle' && `Mensuelle (${plan.jours_mois?.join(', ')})`}
              </td>
              <td className="px-4 py-2">{plan.heure_depart}</td>
              <td className="px-4 py-2">{plan.heure_arrivee || '-'}</td>
              <td className="px-4 py-2">
                {plan.active ? (
                  <span className="text-green-600">Active</span>
                ) : (
                  <span className="text-red-500">Désactivée</span>
                )}
              </td>
              <td className="px-4 py-2 flex gap-2">
                <Button size="sm" variant="ghost" onClick={() => onEdit(plan)}>
                  <Pencil className="w-5 h-5 text-blue-600" />
                </Button>
                
                <Button size="sm" variant="ghost" onClick={() => onDelete(plan.id)}>
                  <Trash className="w-5 h-5 text-red-600" />
                </Button>
              </td>
            </tr>
          ))}
          {planFiltres.length === 0 && (
            <tr>
              <td colSpan={6} className="text-center py-4 text-gray-500">
                Aucune planification trouvée.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

export default ListePlanifications
