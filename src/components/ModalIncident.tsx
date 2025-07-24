import React, { useState } from 'react'
import { MapContainer, TileLayer, Marker } from 'react-leaflet'
import { X } from 'lucide-react'
import 'leaflet/dist/leaflet.css'

interface CarteIncidentModalProps {
  open: boolean
  lat: number
  lng: number
  onClose: () => void
}

const CarteIncidentModal: React.FC<CarteIncidentModalProps> = ({
  open, lat, lng, onClose
}) => {
  if (!open) return null
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" onClick={onClose} />
      <div className="relative bg-white p-4 rounded-lg shadow-xl max-w-2xl w-full z-50 flex flex-col">
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
          onClick={onClose}
          aria-label="Fermer"
        >
          <X size={24} />
        </button>
        <div className="mb-3 font-semibold">Emplacement de l’incident</div>
        <div className="flex-1 flex items-center justify-center">
          <MapContainer
            center={[lat, lng]}
            zoom={16}
            scrollWheelZoom={true}
            style={{ width: '900px', height: '500px', maxWidth: '90vw', maxHeight: '80vh' }}
            dragging={true}
            doubleClickZoom={true}
            zoomControl={true}
            attributionControl={true}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={[lat, lng]} />
          </MapContainer>
        </div>
      </div>
    </div>
  )
}

interface Props {
  open: boolean
  incidents: any[]
  onClose: () => void
}

const ModalIncident: React.FC<Props> = ({ open, incidents, onClose }) => {
  const [carteOpen, setCarteOpen] = useState(false)
  const [mapPos, setMapPos] = useState<{ lat: number, lng: number } | null>(null)

  if (!open || !Array.isArray(incidents) || incidents.length === 0) return null

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" onClick={onClose} />
      <div className="relative w-full max-w-5xl rounded-lg bg-white p-6 shadow-xl z-50">
        <div className="text-lg font-bold mb-6 text-primary">Liste des incidents de l’exécution</div>
        <div className="overflow-x-auto">
          <table className="min-w-full border text-xs md:text-sm">
            <thead>
              <tr className="bg-gray-100 text-gray-700">
                <th className="px-2 py-2 border">#</th>
                <th className="px-2 py-2 border">Type</th>
                <th className="px-2 py-2 border">Description</th>
                <th className="px-2 py-2 border">Latitude</th>
                <th className="px-2 py-2 border">Longitude</th>
                <th className="px-2 py-2 border">Carte</th>
                <th className="px-2 py-2 border">Photo</th>
              </tr>
            </thead>
            <tbody>
              {incidents.map((inc, idx) => (
                <tr key={idx} className="border-t">
                  <td className="px-2 py-2 text-center">{idx + 1}</td>
                  <td className="px-2 py-2">{inc.type_incident || '—'}</td>
                  <td
                    className="px-2 py-2 max-w-xs truncate"
                    title={inc.description || ''}
                  >
                    {inc.description || '—'}
                  </td>
                  <td className="px-2 py-2">{inc.latitude || '—'}</td>
                  <td className="px-2 py-2">{inc.longitude || '—'}</td>
                  <td className="px-2 py-2">
                    {(inc.latitude && inc.longitude) ? (
                      <button
                        className="text-primary underline text-xs"
                        onClick={() => {
                          setMapPos({ lat: inc.latitude, lng: inc.longitude })
                          setCarteOpen(true)
                        }}
                      >
                        Voir la carte
                      </button>
                    ) : '—'}
                  </td>
                  <td className="px-2 py-2">
                    {inc.photo_url ? (
                      <img src={inc.photo_url} alt="Photo incident" className="max-h-20 rounded border mx-auto" />
                    ) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex justify-end mt-6">
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-100 text-gray-800 px-4 py-2 rounded hover:bg-gray-200 font-medium shadow-sm"
          >
            Fermer
          </button>
        </div>
        <CarteIncidentModal
          open={carteOpen && !!mapPos}
          lat={mapPos?.lat || 0}
          lng={mapPos?.lng || 0}
          onClose={() => setCarteOpen(false)}
        />
      </div>
    </div>
  )
}

export default ModalIncident
