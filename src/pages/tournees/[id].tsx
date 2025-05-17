// ✅ Fichier : src/pages/tournees/EditTournee.tsx
// ⚠️ Assurez-vous que la route /tournees/:id est déclarée dans App.tsx

import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { fetchTourneeById, updateTournee } from '../../lib/api'

function EditTournee() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    nom: '',
    date: '',
    type: '',
    conducteur_id: '',
    arrivee_lat: '',
    arrivee_lng: '',
    adresse: '',
    hr_depart_prevu: '',
    hr_arrivee_prevu: '',
    statut: true,
    bus_id: ''
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return
    fetchTourneeById(id)
      .then(data => {
        setFormData({
          nom: data.nom || '',
          date: data.date || '',
          type: data.type || '',
          conducteur_id: data.conducteur_id || '',
          arrivee_lat: data.arrivee_lat || '',
          arrivee_lng: data.arrivee_lng || '',
          adresse: data.adresse || '',
          hr_depart_prevu: data.hr_depart_prevu || '',
          hr_arrivee_prevu: data.hr_arrivee_prevu || '',
          statut: data.statut ?? true,
          bus_id: data.bus_id || ''
        })
        setLoading(false)
      })
      .catch(err => {
        setError('Erreur lors du chargement de la tournée')
        setLoading(false)
      })
  }, [id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id) return
    try {
      await updateTournee(id, formData)
      navigate('/tournees')
    } catch (err: any) {
      alert(err.message || 'Erreur lors de la mise à jour')
    }
  }

  if (loading) return <p>Chargement...</p>
  if (error) return <p className="text-red-600">{error}</p>

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Modifier la tournée</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="nom" value={formData.nom} onChange={handleChange} placeholder="Nom" className="w-full p-2 border rounded" />
        <input type="date" name="date" value={formData.date} onChange={handleChange} className="w-full p-2 border rounded" />
        <input name="type" value={formData.type} onChange={handleChange} placeholder="Type" className="w-full p-2 border rounded" />
        <input name="conducteur_id" value={formData.conducteur_id} onChange={handleChange} placeholder="ID conducteur" className="w-full p-2 border rounded" />
        <input name="adresse" value={formData.adresse} onChange={handleChange} placeholder="Adresse" className="w-full p-2 border rounded" />
        <input name="arrivee_lat" value={formData.arrivee_lat} onChange={handleChange} placeholder="Latitude arrivée" className="w-full p-2 border rounded" />
        <input name="arrivee_lng" value={formData.arrivee_lng} onChange={handleChange} placeholder="Longitude arrivée" className="w-full p-2 border rounded" />
        <input type="time" name="hr_depart_prevu" value={formData.hr_depart_prevu} onChange={handleChange} className="w-full p-2 border rounded" />
        <input type="time" name="hr_arrivee_prevu" value={formData.hr_arrivee_prevu} onChange={handleChange} className="w-full p-2 border rounded" />
        <input name="bus_id" value={formData.bus_id} onChange={handleChange} placeholder="ID bus" className="w-full p-2 border rounded" />
        <label className="flex items-center gap-2">
          <input type="checkbox" name="statut" checked={formData.statut} onChange={handleChange} /> Actif
        </label>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Mettre à jour</button>
      </form>
    </div>
  )
}

export default EditTournee
