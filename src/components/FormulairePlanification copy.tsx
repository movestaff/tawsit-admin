import React, { useEffect, useState } from 'react'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Button } from './ui/button'
import { toast } from 'react-toastify'
import { ajouterPlanification, updatePlanification } from '../lib/api'

interface Props {
  planification?: any
  tournees: any[]
  onSuccess: () => void
  onCancel: () => void
}

const FormulairePlanification: React.FC<Props> = ({ planification, tournees, onSuccess, onCancel }) => {
  const [form, setForm] = useState({
    tournee_id: '',
    recurrence_type: 'unique',
    date_unique: '',
    jours_semaine: [] as string[],
    jours_mois: [] as number[],
    heure_depart: '',
    heure_arrivee: '',
    active: true
  })

  useEffect(() => {
    if (planification) setForm({ ...form, ...planification })
  }, [planification])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    if (type === 'checkbox' && name === 'jours_semaine') {
      const checked = (e.target as HTMLInputElement).checked
      setForm(prev => {
        const jours = new Set(prev.jours_semaine)
        checked ? jours.add(value) : jours.delete(value)
        return { ...prev, jours_semaine: Array.from(jours) }
      })
    } else if (type === 'checkbox' && name === 'active') {
      const checked = (e.target as HTMLInputElement).checked
      setForm(prev => ({ ...prev, active: checked }))
    } else {
      setForm(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (planification) {
        await updatePlanification(planification.id, form)
        toast.success('Planification mise à jour.')
      } else {
        await ajouterPlanification(form)
        toast.success('Planification ajoutée.')
      }
      onSuccess()
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de l’enregistrement')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Tournée</Label>
        <select name="tournee_id" value={form.tournee_id} onChange={handleChange} className="w-full border rounded px-2 py-1">
          <option value="">-- Sélectionner --</option>
          {tournees.map(t => <option key={t.id} value={t.id}>{t.nom}</option>)}
        </select>
      </div>

      <div>
        <Label>Type de récurrence</Label>
        <select name="recurrence_type" value={form.recurrence_type} onChange={handleChange} className="w-full border rounded px-2 py-1">
          <option value="unique">Unique</option>
          <option value="hebdomadaire">Hebdomadaire</option>
          <option value="mensuelle">Mensuelle</option>
        </select>
      </div>

      {form.recurrence_type === 'unique' && (
        <div>
          <Label>Date</Label>
          <Input type="date" name="date_unique" value={form.date_unique} onChange={handleChange} />
        </div>
      )}

      {form.recurrence_type === 'hebdomadaire' && (
        <div>
          <Label>Jours de la semaine</Label>
          <div className="flex flex-wrap gap-2">
            {["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"].map(jour => (
              <label key={jour} className="flex items-center gap-1">
                <input
                  type="checkbox"
                  name="jours_semaine"
                  value={jour}
                  checked={form.jours_semaine.includes(jour)}
                  onChange={handleChange}
                />
                {jour}
              </label>
            ))}
          </div>
        </div>
      )}

      {form.recurrence_type === 'mensuelle' && (
        <div>
          <Label>Jours du mois</Label>
          <Input
            type="text"
            name="jours_mois"
            value={form.jours_mois.join(',')}
            onChange={e => setForm(prev => ({ ...prev, jours_mois: e.target.value.split(',').map(v => parseInt(v.trim())).filter(v => !isNaN(v)) }))}
            placeholder="Ex : 1,15,30"
          />
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Heure de départ</Label>
          <Input type="time" name="heure_depart" value={form.heure_depart} onChange={handleChange} />
        </div>
        <div>
          <Label>Heure d’arrivée</Label>
          <Input type="time" name="heure_arrivee" value={form.heure_arrivee} onChange={handleChange} />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input type="checkbox" name="active" checked={form.active} onChange={handleChange} />
        <Label>Active</Label>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>Annuler</Button>
        <Button type="submit" className="bg-green-700 text-white">{planification ? 'Mettre à jour' : 'Enregistrer'}</Button>
      </div>
    </form>
  )
}

export default FormulairePlanification
