import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { affecterVehiculeConducteur, fetchConducteursDispoPourVehicule } from '../../lib/api'
import { Button } from '../ui/button'
import { Input } from '../ui/input'

function ModalAffectationConducteur({ vehicule, onSuccess, onCancel }: any) {
  const [conducteurs, setConducteurs] = useState<any[]>([])
  const [form, setForm] = useState({ conducteur_id: '', date_debut: '' })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]
    setForm(prev => ({ ...prev, date_debut: today }))
    fetchConducteursDispoPourVehicule().then(setConducteurs).catch(() => toast.error('Erreur chargement conducteurs'))
  }, [vehicule])

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      await affecterVehiculeConducteur({ ...form, vehicule_id: vehicule.id })
      toast.success('Conducteur affecté')
      onSuccess()
    } catch (e: any) {
      toast.error(e.message || 'Erreur lors de l\'affectation')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Affecter un conducteur</h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Conducteur</label>
          <select name="conducteur_id" value={form.conducteur_id} onChange={handleChange} className="w-full border rounded px-3 py-2">
            <option value="">-- Choisir un conducteur --</option>
            {conducteurs.map(c => (
              <option key={c.id} value={c.id}>{c.nom} {c.prenom}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium">Date de début</label>
          <input type="date" name="date_debut" value={form.date_debut} disabled className="w-full border rounded px-3 py-2" />
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onCancel}>Annuler</Button>
        <Button onClick={handleSubmit} disabled={loading || !form.conducteur_id}>
          Affecter
        </Button>
      </div>
    </div>
  )
}

export default ModalAffectationConducteur
