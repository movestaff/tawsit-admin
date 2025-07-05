import React, { useEffect, useState } from 'react'
import { createOrUpdateGroupeEmployes, fetchSites } from '../lib/api'
import { toast } from 'react-toastify'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Select } from './ui/select'
import { Checkbox } from './ui/checkbox'

const joursSemaine = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']

export default function FormulaireGroupeEmploye({ groupe, onSuccess, onCancel }: any) {
  const [form, setForm] = useState<{
    nom: string
    heure_debut: string
    heure_fin: string
    type: string
    recurrence_type: string
    jours_semaine: string[]
    jours_mois: number[]
    date_unique: string
    site_id: string
  }>({
    nom: '',
    heure_debut: '',
    heure_fin: '',
    type: 'depart',
    recurrence_type: 'unique',
    jours_semaine: [],
    jours_mois: [],
    date_unique: '',
    site_id: ''
  })

  const [sites, setSites] = useState<any[]>([])

  useEffect(() => {
    fetchSites().then(setSites).catch(() => toast.error('Erreur chargement des sites'))
  }, [])

  useEffect(() => {
    if (groupe) {
      setForm({
        nom: groupe.nom || '',
        heure_debut: groupe.heure_debut || '',
        heure_fin: groupe.heure_fin || '',
        type: groupe.type || 'depart',
        recurrence_type: groupe.recurrence_type || 'unique',
        jours_semaine: groupe.jours_semaine || [],
        jours_mois: groupe.jours_mois || [],
        date_unique: groupe.date_unique || '',
        site_id: groupe.site_id || ''
      })
    }
  }, [groupe])

  const handleChange = (key: string, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    try {
      await createOrUpdateGroupeEmployes(groupe ? { id: groupe.id, ...form } : form)
      toast.success('Groupe enregistré')
      onSuccess()
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div>
        <label className="block mb-1 font-medium">Nom du groupe</label>
        <Input
          value={form.nom}
          onChange={(e) => handleChange('nom', e.target.value)}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block mb-1 font-medium">Heure de départ</label>
          <Input type="time" value={form.heure_debut} onChange={(e) => handleChange('heure_debut', e.target.value)} required />
        </div>

        <div>
          <label className="block mb-1 font-medium">Heure d’arrivée</label>
          <Input type="time" value={form.heure_fin} onChange={(e) => handleChange('heure_fin', e.target.value)} required />
        </div>

        <div>
          <label className="block mb-1 font-medium">Type</label>
          <Select value={form.type} onChange={(e) => handleChange('type', e.target.value)}>
            <option value="depart">Départ</option>
            <option value="retour">Retour</option>
          </Select>
        </div>

        <div>
          <label className="block mb-1 font-medium">Site</label>
          <Select value={form.site_id} onChange={(e) => handleChange('site_id', e.target.value)}>
            <option value="">Choisir un site</option>
            {sites.map((site) => (
              <option key={site.id} value={site.id}>{site.nom}</option>
            ))}
          </Select>
        </div>

        <div>
          <label className="block mb-1 font-medium">Récurrence</label>
          <Select value={form.recurrence_type} onChange={(e) => handleChange('recurrence_type', e.target.value)}>
            <option value="unique">Unique</option>
            <option value="hebdomadaire">Hebdomadaire</option>
            <option value="mensuelle">Mensuelle</option>
          </Select>
        </div>
      </div>

      {form.recurrence_type === 'unique' && (
        <div>
          <label className="block mb-1 font-medium">Date</label>
          <Input type="date" value={form.date_unique} onChange={(e) => handleChange('date_unique', e.target.value)} required />
        </div>
      )}

      {form.recurrence_type === 'hebdomadaire' && (
        <div>
          <label className="block mb-1 font-medium">Jours de la semaine</label>
          <div className="grid grid-cols-3 gap-2">
            {joursSemaine.map((jour) => (
              <label key={jour} className="flex items-center space-x-2">
                <Checkbox
                  checked={form.jours_semaine.includes(jour)}
                  onChange={(e) => {
                    const checked = (e.target as HTMLInputElement).checked
                    const jours = checked
                      ? [...form.jours_semaine, jour]
                      : form.jours_semaine.filter((j) => j !== jour)
                    handleChange('jours_semaine', jours)
                  }}
                />
                <span>{jour}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {form.recurrence_type === 'mensuelle' && (
        <div>
          <label className="block mb-1 font-medium">Jours du mois (ex: 1,15,30)</label>
          <Input
            type="text"
            value={form.jours_mois.join(',')}
            onChange={(e) => handleChange('jours_mois', e.target.value.split(',').map((n: string) => parseInt(n.trim())).filter(n => !isNaN(n)))}
          />
        </div>
      )}

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>Annuler</Button>
        <Button type="submit">Enregistrer</Button>
      </div>
    </form>
  )
}