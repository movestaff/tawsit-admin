// ✅ AjoutTournee.tsx (formulaire complet avec tous les champs)

import React, { useEffect, useState } from 'react'
import { ajouterTournee, getConducteurs } from '../lib/api'

interface Props {
  onSuccess: () => void
}

function AjouterTournee({ onSuccess }: Props) {
  const [nom, setNom] = useState('')
  const [date, setDate] = useState('')
  const [type, setType] = useState('fixe')
  const [conducteurId, setConducteurId] = useState('')
  const [adresse, setAdresse] = useState('')
  const [hrDepart, setHrDepart] = useState('')
  const [hrArrivee, setHrArrivee] = useState('')
  const [arriveeLat, setArriveeLat] = useState('')
  const [arriveeLng, setArriveeLng] = useState('')
  const [busId, setBusId] = useState('')
  const [statut, setStatut] = useState(true)

  const [conducteurs, setConducteurs] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const chargerConducteurs = async () => {
      try {
        const data = await getConducteurs()
        setConducteurs(data)
      } catch (e) {
        console.warn('❌ Erreur chargement conducteurs:', e)
      }
    }

    chargerConducteurs()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const tournee = {
        nom,
        date,
        type,
        conducteur_id: conducteurId,
        adresse,
        hr_depart_prevu: hrDepart,
        hr_arrivee_prevu: hrArrivee,
        arrivee_lat: parseFloat(arriveeLat),
        arrivee_lng: parseFloat(arriveeLng),
        bus_id: busId,
        statut
      }

      await ajouterTournee(tournee)
      setMessage('✅ Tournée ajoutée !')

      // Réinitialiser le formulaire
      setNom('')
      setDate('')
      setType('fixe')
      setConducteurId('')
      setAdresse('')
      setHrDepart('')
      setHrArrivee('')
      setArriveeLat('')
      setArriveeLng('')
      setBusId('')
      setStatut(true)

      onSuccess()
    } catch (e: any) {
      setMessage(e.message || '❌ Erreur lors de l’ajout')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mb-6 bg-gray-50 p-4 rounded">
      <h2 className="text-lg font-semibold mb-4">Ajouter une tournée</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input type="text" placeholder="Nom" value={nom} onChange={(e) => setNom(e.target.value)} className="border px-3 py-2 rounded" required />
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="border px-3 py-2 rounded" required />

        <select value={type} onChange={(e) => setType(e.target.value)} className="border px-3 py-2 rounded">
          <option value="fixe">Fixe</option>
          <option value="flexible">Flexible</option>
        </select>

        <select value={conducteurId} onChange={(e) => setConducteurId(e.target.value)} className="border px-3 py-2 rounded" required>
          <option value="">-- Choisir un conducteur --</option>
          {conducteurs.map((c) => (
            <option key={c.id} value={c.id}>{c.display_name || c.email}</option>
          ))}
        </select>

        <input type="text" placeholder="Adresse d’arrivée" value={adresse} onChange={(e) => setAdresse(e.target.value)} className="border px-3 py-2 rounded" />
        <input type="time" placeholder="Heure départ" value={hrDepart} onChange={(e) => setHrDepart(e.target.value)} className="border px-3 py-2 rounded" />
        <input type="time" placeholder="Heure arrivée" value={hrArrivee} onChange={(e) => setHrArrivee(e.target.value)} className="border px-3 py-2 rounded" />

        <input type="text" placeholder="Latitude arrivée" value={arriveeLat} onChange={(e) => setArriveeLat(e.target.value)} className="border px-3 py-2 rounded" />
        <input type="text" placeholder="Longitude arrivée" value={arriveeLng} onChange={(e) => setArriveeLng(e.target.value)} className="border px-3 py-2 rounded" />

        <input type="text" placeholder="Bus ID (optionnel)" value={busId} onChange={(e) => setBusId(e.target.value)} className="border px-3 py-2 rounded" />

        <label className="flex items-center gap-2">
          <input type="checkbox" checked={statut} onChange={(e) => setStatut(e.target.checked)} />
          Active ?
        </label>
      </div>

      <button type="submit" disabled={loading} className="mt-4 bg-primary text-white px-4 py-2 rounded">
        {loading ? 'Ajout en cours...' : 'Créer la tournée'}
      </button>

      {message && <p className="mt-2 text-sm text-gray-700">{message}</p>}
    </form>
  )
}

export default AjouterTournee
