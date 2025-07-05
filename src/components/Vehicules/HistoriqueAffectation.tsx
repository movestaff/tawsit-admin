import React, { useEffect, useState } from 'react'
import { fetchHistoriqueAffectationsVehicule, retirerAffectationVehiculeConducteur } from '../../lib/api'
import { Button } from '../ui/button'
import { Trash2 } from 'lucide-react'
import { toast } from 'react-toastify'

function HistoriqueAffectation({ vehicule, onClose }: any) {
  const [historique, setHistorique] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const load = async () => {
    const data = await fetchHistoriqueAffectationsVehicule(vehicule.id)
    setHistorique(data)
  }

  useEffect(() => {
    load()
  }, [vehicule])

  const handleRetirer = async (id: string) => {
    try {
      await retirerAffectationVehiculeConducteur(id)
      toast.success('Affectation clôturée')
      await load()
    } catch (e: any) {
      toast.error(e.message || 'Erreur')
    }
  }

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-semibold">Historique des affectations</h2>
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="text-left px-2 py-1">Conducteur</th>
            <th className="text-left px-2 py-1">Début</th>
            <th className="text-left px-2 py-1">Fin</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {historique.map((h: any) => (
            <tr
              key={h.id}
              className={`border-t ${!h.date_fin ? 'bg-green-50 text-green-700 font-semibold' : 'bg-red-50 text-red-700'}`}
            >
              <td className="px-2 py-1">{h.conducteur?.nom} {h.conducteur?.prenom}</td>
              <td className="px-2 py-1">{h.date_debut}</td>
              <td className="px-2 py-1">{h.date_fin || 'En cours'}</td>
              <td className="px-2 py-1 text-right">
                {!h.date_fin && (
                  <Button size="sm" variant="ghost" onClick={() => handleRetirer(h.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </td>
            </tr>
          ))}
          {historique.length === 0 && (
            <tr><td colSpan={4} className="text-center text-gray-500 py-2">Aucune affectation</td></tr>
          )}
        </tbody>
      </table>
      <div className="flex justify-end">
        <Button onClick={onClose}>Fermer</Button>
      </div>
    </div>
  )
}

export default HistoriqueAffectation
