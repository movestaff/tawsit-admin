import React, { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { fetchTournees, fetchPositionsConducteurs } from '../lib/api'
import { fetchPointsArretParTournee } from '../lib/api'

const conducteurIcon = new L.Icon({
  iconUrl: '/bus-icon.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
})

const conducteurExcèsIcon = new L.Icon({
  iconUrl: '/bus-icon-alert.png', 
  iconSize: [32, 32],
  iconAnchor: [16, 32],
})

// Icône de point d’arrêt
const arretIcon = new L.DivIcon({
  html: `<div style="
    width: 20px;
    height: 20px;
    background-color: #228B22;
    border-radius: 50%;
    border: 2px solid white;
    box-shadow: 0 0 4px rgba(0,0,0,0.3);
  "></div>`,
  iconSize: [16, 16],
  className: 'arret-marker',
})
// Composant pour recentrer dynamiquement
const CenterMap = ({ lat, lng }: { lat: number; lng: number }) => {
  const map = useMap()
  useEffect(() => {
    map.setView([lat, lng], 13)
  }, [lat, lng])
  return null
}

const Carte = () => {
  const [positions, setPositions] = useState<any[]>([])
  const [tournees, setTournees] = useState<any[]>([])
  const [selectedTourneeId, setSelectedTourneeId] = useState<string>('')
  const [selectedConducteurId, setSelectedConducteurId] = useState<string>('')
  const [centerCoords, setCenterCoords] = useState<[number, number] | null>(null)

  // Tournées
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchTournees()
        setTournees(data)
      } catch (err) {
        console.error('Erreur récupération des tournées:', err)
      }
    }
    fetchData()
  }, [])

  // Positions des conducteurs (rafraîchi toutes les 10 secondes)
  useEffect(() => {
    const fetchPositions = async () => {
      try {
        const data = await fetchPositionsConducteurs()
        console.log('Positions récupérées:', data)
        const filtres = selectedTourneeId
          ? data.filter((p: any) => p.tournee_id === selectedTourneeId)
          : data
        setPositions(filtres)
      } catch (error) {
        console.error('Erreur récupération des positions:', error)
      }
    }

    fetchPositions()
    const interval = setInterval(fetchPositions, 10000)
    return () => clearInterval(interval)
  }, [selectedTourneeId])

  const handleCenterOnConducteur = () => {
    const conducteur = positions.find((p) => p.conducteur_id === selectedConducteurId)
    if (conducteur) {
      setCenterCoords([conducteur.latitude, conducteur.longitude])
    }
  }

  const handleAfficherTous = () => {
    setCenterCoords(null)
    setSelectedConducteurId('')
  }
const [pointsArret, setPointsArret] = useState<any[]>([])

useEffect(() => {
  const fetchArrets = async () => {
    if (!selectedTourneeId) {
      setPointsArret([])
      return
    }
    try {
      const data = await fetchPointsArretParTournee(selectedTourneeId)
      setPointsArret(data)
    } catch (err) {
      console.error('Erreur chargement des arrêts:', err)
    }
  }

  fetchArrets()
}, [selectedTourneeId])


  return (
    <div className="min-h-screen bg-secondary text-gray-800 p-6">
      <h1 className="text-3xl font-bold text-primary mb-4">Carte temps réel – Conducteurs</h1>

      <div className="mb-4 flex flex-wrap gap-4 items-center">
        <label className="font-semibold">Filtrer par tournée :</label>
        <select
          className="p-2 border rounded"
          value={selectedTourneeId}
          onChange={(e) => setSelectedTourneeId(e.target.value)}
        >
          <option value="">Toutes les tournées</option>
          {tournees.map((t) => (
            <option key={t.id} value={t.id}>
              {t.nom || t.id}
            </option>
          ))}
        </select>

        <label className="font-semibold ml-6">Centrer sur un conducteur :</label>
        <select
          className="p-2 border rounded"
          value={selectedConducteurId}
          onChange={(e) => setSelectedConducteurId(e.target.value)}
        >
          <option value="">Sélectionner un conducteur</option>
          {positions.map((p) => (
            <option key={p.conducteur_id} value={p.conducteur_id}>
              {p.nom}
            </option>
          ))}
        </select>

        <button
          onClick={handleCenterOnConducteur}
          className="bg-primary text-white px-4 py-2 rounded"
        >
          Centrer
        </button>

        <button
          onClick={handleAfficherTous}
          className="bg-gray-400 text-white px-4 py-2 rounded"
        >
          Afficher tous
        </button>
      </div>

      {positions.length === 0 ? (
        <p className="text-lg text-gray-600 mt-8">
          Aucun conducteur actif actuellement.
        </p>
      ) : (
        <MapContainer center={[33.589886, -7.603869]} zoom={7} style={{ height: '600px', width: '100%' }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />
          {centerCoords && <CenterMap lat={centerCoords[0]} lng={centerCoords[1]} />}
          {positions.map((pos, idx) => (
            <Marker
              key={idx}
              position={[pos.latitude, pos.longitude]}
              icon={pos.aDepasseVitesse ? conducteurExcèsIcon : conducteurIcon}
            >
              <Popup>
                <strong>{pos.nom}</strong><br />
                Vitesse : {pos.vitesse ?? 0} km/h<br />
                Dernière mise à jour : {new Date(pos.timestamp).toLocaleTimeString()}
              </Popup>
            </Marker>



          ))}


          {pointsArret.map((arret, idx) => (
  <Marker
    key={`arret-${idx}`}
    position={[arret.latitude, arret.longitude]}
    icon={arretIcon}
  >
    <Popup>
      <strong>{arret.nom}</strong><br />
      Latitude : {arret.latitude}<br />
      Longitude : {arret.longitude}
    </Popup>
  </Marker>
))}

        </MapContainer>
      )}
    </div>
  )
}

export default Carte
