import React, { useEffect, useState } from 'react'
import { fetchTournees, updateTournee } from '../lib/api'
import { Button } from './ui/button'
import { toast } from 'react-toastify'

const ModalAjouterTourneeAuSite = ({ siteId, onAffectation }: { siteId: string, onAffectation: () => void }) => {
  const [tournees, setTournees] = useState<any[]>([])
  const [selection, setSelection] = useState<Record<string, boolean>>({})

  const chargerTournees = async () => {
    try {
      const data = await fetchTournees()
      const sansSite = data.filter((t: any) => !t.site_id)
      setTournees(sansSite)
    } catch (err: any) {
      toast.error(err.message || 'Erreur chargement tournées')
    }
  }

  useEffect(() => {
    chargerTournees()
  }, [])

  const toggleSelection = (id: string) => {
    setSelection((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const affecter = async () => {
    const ids = Object.keys(selection).filter((id) => selection[id])
    if (!ids.length) return toast.warning('Sélectionnez au moins une tournée')
    try {
      await Promise.all(ids.map(id => updateTournee(id, { site_id: siteId })))
      toast.success('Tournées affectées')
      onAffectation()
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de l’affectation')
    }
  }

  return (
    <div className="space-y-4">
      <table className="min-w-full text-sm text-gray-800 border">
        <thead className="bg-secondary text-left font-semibold text-gray-700">
          <tr>
            <th className="px-4 py-2">Sélection</th>
            <th className="px-4 py-2">Nom</th>
            <th className="px-4 py-2">Type</th>
          </tr>
        </thead>
        <tbody>
          {tournees.map((t) => (
            <tr key={t.id} className="border-t">
              <td className="px-4 py-2">
                <input
                  type="checkbox"
                  checked={!!selection[t.id]}
                  onChange={() => toggleSelection(t.id)}
                />
              </td>
              <td className="px-4 py-2">{t.nom}</td>
              <td className="px-4 py-2">{t.type}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <Button className="bg-green-700 text-white" onClick={affecter}>Affecter au site</Button>
    </div>
  )
}

export default ModalAjouterTourneeAuSite
