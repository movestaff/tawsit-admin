// ✅ Fichier mis à jour : src/components/FormulaireTournee.tsx
import React, { useEffect, useState } from 'react'
import { Input } from '../components/ui/input'
import { Button } from '../components/ui/button'
import { Label } from '../components/ui/label'
import { Switch } from '../components/ui/switch'
import { toast } from 'react-toastify'
import { ajouterTournee, updateTournee, deleteTournee } from '../lib/api'

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
    adresse: '',
    arrivee_lat: '',
    arrivee_lng: '',
    hr_depart_prevu: '',
    hr_arrivee_prevu: '',
    conducteur_id: '',
    statut: true
  })

  useEffect(() => {
    if (tournee) {
      setForm({
        nom: tournee.nom || '',
        type: tournee.type || '',
        date: tournee.date || '',
        adresse: tournee.adresse || '',
        arrivee_lat: tournee.arrivee_lat || '',
        arrivee_lng: tournee.arrivee_lng || '',
        hr_depart_prevu: tournee.hr_depart_prevu || '',
        hr_arrivee_prevu: tournee.hr_arrivee_prevu || '',
        conducteur_id: tournee.conducteur_id || '',
        statut: tournee.statut ?? true
      })
    }
  }, [tournee])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
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
    <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <h2 className="md:col-span-2 text-xl font-semibold">
        {tournee ? `Modifier la tournée : ${tournee.nom}` : 'Créer une nouvelle tournée'}
      </h2>

      <div>
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

      {/* Adresse sur toute la largeur */}
      <div className="md:col-span-2">
        <Label htmlFor="adresse">Adresse d’arrivée</Label>
        <Input id="adresse" name="adresse" value={form.adresse} onChange={handleChange} placeholder="Lieu d’arrivée" />
      </div>

      {/* Latitude / Longitude sur une seule ligne */}
      <div>
        <Label htmlFor="arrivee_lat">Latitude</Label>
        <Input id="arrivee_lat" name="arrivee_lat" value={form.arrivee_lat} onChange={handleChange} />
      </div>
      <div>
        <Label htmlFor="arrivee_lng">Longitude</Label>
        <Input id="arrivee_lng" name="arrivee_lng" value={form.arrivee_lng} onChange={handleChange} />
      </div>

      {/* Heure départ / arrivée sur la même ligne */}
      <div>
        <Label htmlFor="hr_depart_prevu">Heure départ</Label>
        <Input type="time" id="hr_depart_prevu" name="hr_depart_prevu" value={form.hr_depart_prevu} onChange={handleChange} />
      </div>
      <div>
        <Label htmlFor="hr_arrivee_prevu">Heure arrivée</Label>
        <Input type="time" id="hr_arrivee_prevu" name="hr_arrivee_prevu" value={form.hr_arrivee_prevu} onChange={handleChange} />
      </div>

      {/* Statut switch */}
      <div className="flex items-center gap-3">
        <Label htmlFor="statut">Statut</Label>
        <Switch
          checked={form.statut}
          onChange={(val) => setForm({ ...form, statut: val })}
        />
        <span>{form.statut ? 'Actif' : 'Inactif'}</span>
      </div>

      {/* Boutons */}
      <div className="md:col-span-2 flex justify-start gap-4 mt-6">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Annuler
          </Button>
        )}
        <Button type="button" onClick={handleSubmit}>
          {tournee ? 'Mettre à jour' : 'Enregistrer'}
        </Button>
        {tournee && (
          <Button
            type="button"
            onClick={handleDelete}
            className="bg-orange-600 hover:bg-orange-700 text-white"
          >
            Supprimer
          </Button>
        )}
      </div>
    </form>
  )
}

export default FormulaireTournee
