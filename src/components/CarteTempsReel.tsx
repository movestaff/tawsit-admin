// src/components/CarteTempsReel.tsx
import { MapContainer, TileLayer, Marker, Polyline } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

interface Props {
  conducteurPosition: [number, number]
  pointsArret: [number, number][]
  polyline?: [number, number][]
}

const CarteTempsReel: React.FC<Props> = ({ conducteurPosition, pointsArret, polyline }) => {
  const iconBus = new L.Icon({
    iconUrl: '/icons/bus-icon.png', // remplace par ton icône
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  })

  return (
    <MapContainer center={conducteurPosition} zoom={14} style={{ height: '600px', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />

      <Marker position={conducteurPosition} icon={iconBus} />

      {pointsArret.map((pos, i) => (
        <Marker key={i} position={pos} />
      ))}

      {polyline && <Polyline positions={polyline} color="green" />}
    </MapContainer>
  )
}

export default CarteTempsReel
