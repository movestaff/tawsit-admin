// ✅ src/components/FormulaireTournee.tsx
import React, { useEffect, useState } from 'react'
import { Input } from '../components/ui/input'
import { Button } from '../components/ui/button'
import { Label } from '../components/ui/label'
import { Switch } from '../components/ui/switch'
import { toast } from 'react-toastify'
import { ajouterTournee, updateTournee, deleteTournee, fetchSites } from '../lib/api'

interface Props {
  tournee?: any
  conducteurs: any[]
  onSuccess: () => void
  onCancel?: () => void
}

const FormulaireTournee: React.FC<Props> = ({ tournee, conducteurs, onSuccess, onCancel }) => {
  const [form, setForm] = useState({
    nom: '',
    type: '',
    date: '',
    site_id: '',
    arrivee_lat: '',
    arrivee_lng: '',
    hr_depart_prevu: '',
    hr_arrivee_prevu: '',
    conducteur_id: '',
    statut: true,
  })
  const [sites, setSites] = useState<any[]>([])

  useEffect(() => {
    fetchSites().then(setSites).catch(() => toast.error("Erreur lors du chargement des sites"))
  }, [])

  useEffect(() => {
    if (tournee) {
      setForm({
        nom: tournee.nom || '',
        type: tournee.type || '',
        date: tournee.date || '',
        site_id: tournee.site_id || '',
        arrivee_lat: tournee.arrivee_lat || '',
        arrivee_lng: tournee.arrivee_lng || '',
        hr_depart_prevu: tournee.hr_depart_prevu || '',
        hr_arrivee_prevu: tournee.hr_arrivee_prevu || '',
        conducteur_id: tournee.conducteur_id || '',
        statut: tournee.statut ?? true,
      })
    }
  }, [tournee])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSiteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const site_id = e.target.value
    const selected = sites.find(s => s.id === site_id)
    if (selected) {
      setForm(prev => ({
        ...prev,
        site_id,
        arrivee_lat: selected.latitude,
        arrivee_lng: selected.longitude,
      }))
    }
  }

  const handleSubmit = async () => {
    if (!form.nom || !form.date || !form.type || !form.conducteur_id) {
      toast.error('Veuillez remplir tous les champs obligatoires.')
      return
    }

    try {
      if (tournee) {
        await updateTournee(tournee.id, form)
        toast.success('Tournée mise à jour !')
      } else {
        await ajouterTournee(form)
        toast.success('Tournée créée avec succès !')
      }
      onSuccess()
    } catch (e) {
      console.error(e)
      toast.error('Erreur lors de la sauvegarde.')
    }
  }

  const handleDelete = async () => {
    if (!tournee) return
    const confirm = window.confirm('Supprimer cette tournée ? Cette action est irréversible.')
    if (!confirm) return

    try {
      await deleteTournee(tournee.id)
      toast.success('Tournée supprimée.')
      onSuccess()
    } catch (e: any) {
      toast.error(e.message || 'Suppression impossible (liens existants ?)')
    }
  }

  return (
    <form className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
      <h2 className="md:col-span-2 text-xl font-semibold mb-2">
        {tournee ? `Modifier la tournée : ${tournee.nom}` : 'Créer une nouvelle tournée'}
      </h2>

      <div className="md:col-span-2">
        <Label htmlFor="nom">Nom</Label>
        <Input id="nom" name="nom" value={form.nom} onChange={handleChange} placeholder="Nom de la tournée" />
      </div>

      <div>
        <Label htmlFor="type">Type</Label>
        <select
          id="type"
          name="type"
          value={form.type}
          onChange={handleChange}
          className="border rounded px-2 py-2 w-full"
        >
          <option value="">-- Choisir un type --</option>
          <option value="fixe">Fixe</option>
          <option value="flexible">Flexible</option>
        </select>
      </div>

      <div>
        <Label htmlFor="date">Date</Label>
        <Input type="date" id="date" name="date" value={form.date} onChange={handleChange} />
      </div>

      <div>
        <Label htmlFor="conducteur_id">Conducteur</Label>
        <select
          id="conducteur_id"
          name="conducteur_id"
          value={form.conducteur_id}
          onChange={handleChange}
          className="border rounded px-2 py-2 w-full"
        >
          <option value="">-- Choisir un conducteur --</option>
          {conducteurs.map((c) => (
            <option key={c.id} value={c.id}>{c.display_name}</option>
          ))}
        </select>
      </div>

      <div className="md:col-span-2">
        <Label htmlFor="site_id">Site de destination</Label>
        <select
          id="site_id"
          name="site_id"
          value={form.site_id}
          onChange={handleSiteChange}
          className="border rounded px-2 py-2 w-full"
        >
          <option value="">-- Choisir un site --</option>
          {sites.map((site) => (
            <option key={site.id} value={site.id}>{site.nom}</option>
          ))}
        </select>
      </div>

      <div>
        <Label htmlFor="hr_depart_prevu">Heure départ</Label>
        <Input type="time" id="hr_depart_prevu" name="hr_depart_prevu" value={form.hr_depart_prevu} onChange={handleChange} />
      </div>

      <div>
        <Label htmlFor="hr_arrivee_prevu">Heure arrivée</Label>
        <Input type="time" id="hr_arrivee_prevu" name="hr_arrivee_prevu" value={form.hr_arrivee_prevu} onChange={handleChange} />
      </div>

      <div className="md:col-span-2 flex flex-wrap items-center justify-between gap-4 border-t pt-4 mt-2">
        <div className="flex items-center gap-3">
          <Label htmlFor="statut">Statut</Label>
          <Switch
            checked={form.statut}
            onChange={(val) => setForm({ ...form, statut: val })}
          />
          <span>{form.statut ? 'Actif' : 'Inactif'}</span>
        </div>

        <div className="flex gap-3">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>Annuler</Button>
          )}
          <Button type="button" onClick={handleSubmit} className="bg-primary text-white hover:bg-green-700">
            {tournee ? 'Mettre à jour' : 'Enregistrer'}
          </Button>
          {tournee && (
            <Button type="button" onClick={handleDelete} className="bg-orange-500 text-white hover:bg-orange-600">
              Supprimer
            </Button>
          )}
        </div>
      </div>
    </form>
  )
}

export default FormulaireTournee
