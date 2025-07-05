import React, { useEffect, useState } from 'react'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { ajouterSite, updateSite, geocodeAdresse } from '../lib/api'
import { toast } from 'react-toastify'
import dynamic from 'next/dynamic'

const CartePointArret = dynamic(() => import('./CartePointArret'), { ssr: false })

interface Props {
  site?: any
  onSuccess: () => void
  onCancel: () => void
}

const ModalEditionSite: React.FC<Props> = ({ site, onSuccess, onCancel }) => {
  const [nom, setNom] = useState(site?.nom || '')
  const [adresse, setAdresse] = useState(site?.adresse || '')
  const [latitude, setLatitude] = useState(site?.latitude || 33.5)
  const [longitude, setLongitude] = useState(site?.longitude || -7.6)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    setLoading(true)
    const payload = { nom, adresse, latitude, longitude }
    try {
      if (site?.id) {
        await updateSite(site.id, payload)
        toast.success('Site mis à jour')
      } else {
        await ajouterSite(payload)
        toast.success('Site créé')
      }
      onSuccess()
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de l’enregistrement')
    } finally {
      setLoading(false)
    }
  }

  const handleGeocode = async () => {
    if (!adresse) return toast.warning('Adresse requise')
    try {
      const pos = await geocodeAdresse(adresse)
      if (pos) {
        setLatitude(pos.lat)
        setLongitude(pos.lng)
        toast.success('Position trouvée')
      } else {
        toast.error("Adresse introuvable")
      }
    } catch (err: any) {
      toast.error(err.message || 'Erreur géocodage')
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input value={nom} onChange={(e) => setNom(e.target.value)} placeholder="Nom du site" />
        <div className="flex gap-2">
          <Input value={adresse} onChange={(e) => setAdresse(e.target.value)} placeholder="Adresse" className="flex-1" />
          <Button onClick={handleGeocode}>📍</Button>
        </div>
        <Input value={latitude} onChange={(e) => setLatitude(parseFloat(e.target.value))} placeholder="Latitude" type="number" />
        <Input value={longitude} onChange={(e) => setLongitude(parseFloat(e.target.value))} placeholder="Longitude" type="number" />
      </div>

      <CartePointArret
        latitude={latitude}
        longitude={longitude}
        onSelectPosition={(lat, lng) => {
          setLatitude(lat)
          setLongitude(lng)
        }}
      />

      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onCancel} disabled={loading}>Annuler</Button>
        <Button className="bg-green-700 hover:bg-green-800 text-white" onClick={handleSubmit} disabled={loading}>
          Enregistrer
        </Button>
      </div>
    </div>
  )
}

export default ModalEditionSite
