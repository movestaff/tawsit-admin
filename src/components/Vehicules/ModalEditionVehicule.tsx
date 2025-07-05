import React, { useEffect, useState } from 'react'
import { ajouterVehicule, updateVehicule, fetchStatutsVehicules } from '../../lib/api'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { toast } from 'react-toastify'
import { fetchPrestataires } from '../../lib/api'

function ModalEditionVehicule({ vehicule, onSuccess, onCancel }: any) {
  const [form, setForm] = useState({
    immatriculation: '',
    marque: '',
    modele: '',
    annee: '',
    capacite: '',
    numero_tag: '',
    statut_id: '',
    prestataire_id:''
  })
  const [statuts, setStatuts] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [prestataires, setPrestataires] = useState<any[]>([])

  useEffect(() => {
  fetchPrestataires()
    .then(setPrestataires)
    .catch(() => toast.error('Erreur chargement prestataires'))
}, [])


  useEffect(() => {
    fetchStatutsVehicules().then(setStatuts).catch(() => toast.error('Erreur chargement statuts'))
  }, [])

  useEffect(() => {
    if (vehicule) {
      setForm({
        immatriculation: vehicule.immatriculation || '',
        marque: vehicule.marque || '',
        modele: vehicule.modele || '',
        annee: vehicule.annee || '',
        capacite: vehicule.capacite || '',
        numero_tag: vehicule.numero_tag || '',
        statut_id: vehicule.statut_id?.toString() || '',
        prestataire_id: vehicule.prestataire_id || ''
      })
    }
  }, [vehicule])

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      if (vehicule) {
        await updateVehicule(vehicule.id, form)
        toast.success('Véhicule modifié')
      } else {
        await ajouterVehicule(form)
        toast.success('Véhicule créé')
      }
      onSuccess()
    } catch (e: any) {
      toast.error(e.message || 'Erreur')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Input label="Immatriculation" name="immatriculation" value={form.immatriculation} onChange={handleChange} required />
        <Input label="Marque" name="marque" value={form.marque} onChange={handleChange} />
        <Input label="Modèle" name="modele" value={form.modele} onChange={handleChange} />
        <Input label="Année" name="annee" value={form.annee} onChange={handleChange} type="number" />
        <Input label="Capacité" name="capacite" value={form.capacite} onChange={handleChange} type="number" />
        <Input label="Tag numéro" name="numero_tag" value={form.numero_tag} onChange={handleChange} />

        <div className="col-span-2">
  <label className="block text-sm font-medium mb-1">Prestataire</label>
  <select
    name="prestataire_id"
    value={form.prestataire_id}
    onChange={handleChange}
    className="w-full border rounded px-3 py-2 max-h-60 overflow-y-auto"
  >
    <option value="">-- Choisir un prestataire --</option>
    {prestataires.map((p) => (
      <option key={p.id} value={p.id}>
        {p.nom}
      </option>
    ))}
  </select>
</div>
        <div className="col-span-2">
          <label className="block text-sm font-medium mb-1">Statut</label>
          <select name="statut_id" value={form.statut_id} onChange={handleChange} className="w-full border rounded px-3 py-2">
            <option value="">-- Choisir un statut --</option>
            {statuts.map((s) => (
              <option key={s.id} value={s.id}>{s.libelle}</option>
            ))}
          </select>
        </div>

        
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onCancel}>Annuler</Button>
        <Button onClick={handleSubmit} disabled={loading}>
          {vehicule ? 'Modifier' : 'Créer'}
        </Button>
      </div>
      
    </div>
  )
}

export default ModalEditionVehicule
