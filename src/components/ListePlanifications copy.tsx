import React from 'react'
import { Button } from './ui/button'

interface Props {
  planifications: any[]
  onEdit: (planification: any) => void
  onRefresh: () => void
}

const ListePlanifications: React.FC<Props> = ({ planifications, onEdit, onRefresh }) => {
  return (
    <div className="overflow-x-auto bg-white shadow rounded-lg">
      <table className="min-w-full text-sm text-left">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2">Tournée</th>
            <th className="px-4 py-2">Type</th>
            <th className="px-4 py-2">Départ</th>
            <th className="px-4 py-2">Arrivée</th>
            <th className="px-4 py-2">Statut</th>
            <th className="px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {planifications.map((plan) => (
            <tr key={plan.id} className="border-b hover:bg-gray-50">
              <td className="px-4 py-2">{plan.tournee?.nom || '-'}</td>
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
              <td className="px-4 py-2">
                <Button variant="outline" onClick={() => onEdit(plan)}>
                  Modifier
                </Button>
              </td>
            </tr>
          ))}
          {planifications.length === 0 && (
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
