// src/components/CartePointArret.tsx
import React, { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import type { LatLngExpression } from 'leaflet'
import { useMap } from 'react-leaflet'

interface Props {
  latitude: number
  longitude: number
  onSelectPosition: (lat: number, lng: number) => void
}

const CartePointArret: React.FC<Props> = ({ latitude, longitude, onSelectPosition }) => {
  const defaultCenter: LatLngExpression = [latitude || 33.5, longitude || -7.6]

  const ClickHandler = () => {
    useMapEvents({
      click: (e) => {
        onSelectPosition(e.latlng.lat, e.latlng.lng)
      },
    })
    return null
  }

  const CenterMapOnPosition = ({ lat, lng }: { lat: number, lng: number }) => {
  const map = useMap()

  useEffect(() => {
    if (!isNaN(lat) && !isNaN(lng)) {
      map.setView([lat, lng], 15) // niveau de zoom 15
    }
  }, [lat, lng, map])

  return null
}

  return (
    <MapContainer
  center={defaultCenter}
  zoom={14}
  className="w-full h-[350px] sm:h-[450px] rounded border"
>

      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
      />
      <CenterMapOnPosition lat={latitude} lng={longitude} />
      <ClickHandler />
      <Marker position={[latitude, longitude]} />
    </MapContainer>
  )
}

export default CartePointArret
