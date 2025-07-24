import React, { useEffect, useState } from 'react'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Button } from './ui/button'
import { toast } from 'react-toastify'
import {
  ajouterPlanification,
  updatePlanification,
  fetchPlanificationById
} from '../lib/api'
import { Switch } from './ui/switch'

interface Props {
  planification?: any
  tournees: any[]
  enDuplication?: boolean
  onSuccess: () => void
  onCancel: () => void
  id: string
  readonly: boolean
}

const ChampLectureSeule = ({
  label,
  value,
}: {
  label: string
  value: string | number | undefined
}) => (
  <div className="flex flex-col gap-1 mb-2">
    <span className="font-semibold text-sm text-gray-700">{label}</span>
    <div className="rounded-md border bg-neutral-50 px-3 py-2 text-base text-gray-900 min-h-[38px]">
      {value && value !== '' ? value : <span className="text-gray-400">—</span>}
    </div>
  </div>
)

const FormulairePlanification: React.FC<Props> = ({
  planification: planifProp,
  tournees,
  onSuccess,
  onCancel,
  enDuplication,
  id,
  readonly
}) => {
  const [planification, setPlanification] = useState<any>(planifProp || null)
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
  const [joursMoisInput, setJoursMoisInput] = useState('')

  useEffect(() => {
    if (readonly && !planifProp && id) {
      fetchPlanificationById(id)
        .then(setPlanification)
        .catch(() => setPlanification(null))
    }
  }, [readonly, planifProp, id])

  useEffect(() => {
    if (planification) {
      const planSansId = { ...planification }
      if (enDuplication) delete planSansId.id
      const champsUtiles = {
        tournee_id: planSansId.tournee_id || '',
        recurrence_type: planSansId.recurrence_type || 'unique',
        date_unique: planSansId.date_unique || '',
        jours_semaine: (planSansId.jours_semaine || []).map((j: string) => j.toLowerCase()),
        jours_mois: planSansId.jours_mois || [],
        heure_depart: planSansId.heure_depart || '',
        heure_arrivee: planSansId.heure_arrivee || '',
        active: planSansId.active ?? true
      }
      setForm(prev => ({ ...prev, ...champsUtiles }))
      setJoursMoisInput((planSansId.jours_mois || []).join(','))
    }
  }, [planification, enDuplication])

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
      const joursMoisArray = joursMoisInput
        .split(',')
        .map(v => parseInt(v.trim()))
        .filter(v => !isNaN(v))

      const dataToSend = { ...form, jours_mois: joursMoisArray }

      if (planification && !enDuplication) {
        await updatePlanification(planification.id, dataToSend)
        toast.success('Planification mise à jour.')
      } else {
        await ajouterPlanification(dataToSend)
        toast.success(enDuplication ? 'Planification dupliquée.' : 'Planification ajoutée.')
      }
      onSuccess()
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de l’enregistrement')
    }
  }

  // --- Affichage lecture seule “fiche” ---
  if (readonly) {
  if (!planification)
    return <div className="p-4 text-sm text-gray-600">Aucune planification trouvée.</div>

  const tourneeNom =
    planification.tournee?.nom ||
    tournees.find(t => t.id === planification.tournee_id)?.nom ||
    '—'

  return (
    <form className="space-y-4 w-full max-w-5xl mx-auto p-2 md:p-4">
      <h2 className="text-xl font-bold mb-4 text-primary">Détail planification</h2>
      <div>
        <Label>Tournée</Label>
        <Input value={tourneeNom} readOnly />
      </div>

      <div>
        <Label>Type de récurrence</Label>
        <Input value={form.recurrence_type} readOnly />
      </div>

      {form.recurrence_type === 'unique' && (
        <div>
          <Label>Date</Label>
          <Input type="date" value={form.date_unique} readOnly />
        </div>
      )}

      {form.recurrence_type === 'hebdomadaire' && (
        <div>
          <Label>Jours de la semaine</Label>
          <Input value={(form.jours_semaine || []).join(', ')} readOnly />
        </div>
      )}

      {form.recurrence_type === 'mensuelle' && (
        <div>
          <Label>Jours du mois</Label>
          <Input value={joursMoisInput} readOnly />
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Heure de départ</Label>
          <Input type="time" value={form.heure_depart} readOnly />
        </div>
        <div>
          <Label>Heure d’arrivée</Label>
          <Input type="time" value={form.heure_arrivee} readOnly />
        </div>
      </div>

      <div>
        <Label>Active</Label>
        <Input value={form.active ? 'Oui' : 'Non'} readOnly />
      </div>
    </form>
  )
}


  // --- Formulaire édition/ajout ---
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Tournée</Label>
        <select
          name="tournee_id"
          value={form.tournee_id}
          onChange={handleChange}
          className="w-full border rounded px-2 py-1"
        >
          <option value="">-- Sélectionner --</option>
          {tournees.map(t => (
            <option key={t.id} value={t.id}>
              {t.nom}
            </option>
          ))}
        </select>
      </div>

      <div>
        <Label>Type de récurrence</Label>
        <select
          name="recurrence_type"
          value={form.recurrence_type}
          onChange={handleChange}
          className="w-full border rounded px-2 py-1"
        >
          <option value="unique">Unique</option>
          <option value="hebdomadaire">Hebdomadaire</option>
          <option value="mensuelle">Mensuelle</option>
        </select>
      </div>

      {form.recurrence_type === 'unique' && (
        <div>
          <Label>Date</Label>
          <Input
            type="date"
            name="date_unique"
            value={form.date_unique}
            onChange={handleChange}
          />
        </div>
      )}

      {form.recurrence_type === 'hebdomadaire' && (
        <div>
          <Label>Jours de la semaine</Label>
          <div className="flex flex-wrap gap-2">
            {[
              'lundi',
              'mardi',
              'mercredi',
              'jeudi',
              'vendredi',
              'samedi',
              'dimanche'
            ].map(jour => (
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
            value={joursMoisInput}
            onChange={e => setJoursMoisInput(e.target.value)}
            placeholder="Ex : 1,15,30"
          />
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Heure de départ</Label>
          <Input
            type="time"
            name="heure_depart"
            value={form.heure_depart}
            onChange={handleChange}
          />
        </div>
        <div>
          <Label>Heure d’arrivée</Label>
          <Input
            type="time"
            name="heure_arrivee"
            value={form.heure_arrivee}
            onChange={handleChange}
          />
        </div>
      </div>

      <Switch
        checked={form.active}
        onChange={value => setForm({ ...form, active: value })}
        label="Active"
      />

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit" className="bg-green-700 text-white">
          {planification && !enDuplication ? 'Mettre à jour' : 'Enregistrer'}
        </Button>
      </div>
    </form>
  )
}

export default FormulairePlanification
