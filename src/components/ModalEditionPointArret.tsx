// ✅ src/components/ModalEditionPointArret.tsx

import React, { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from './ui/dialog'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Button } from './ui/button'
import { ajouterPointArret, updatePointArret, geocodeAdresse } from '../lib/api'
import CartePointArret from './CartePointArret'

interface Props {
  open: boolean
  pointArret?: any
  point?: any
  tourneeId: string
  onClose: () => void
  onUpdated?: () => void
}

const ModalEditionPointArret: React.FC<Props> = ({
  open,
  pointArret,
  point,
  tourneeId,
  onClose,
  onUpdated
}) => {
  const [form, setForm] = useState({
    nom: '',
    adresse: '',
    lat: '',
    lng: ''
  })

  useEffect(() => {
    if (point || pointArret) {
      const p = point || pointArret
      setForm({
        nom: p.nom || '',
        adresse: p.adresse || '',
        lat: (p.latitude || p.lat || '').toString(),
        lng: (p.longitude || p.lng || '').toString()
      })
    } else {
      setForm({
        nom: '',
        adresse: '',
        lat: '',
        lng: ''
      })
    }
  }, [point, pointArret])

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))

    if (name === 'adresse' && value.length > 5) {
      const result = await geocodeAdresse(value)
      if (result) {
        setForm(prev => ({
          ...prev,
          lat: result.lat.toString(),
          lng: result.lng.toString()
        }))
      }
    }
  }

  const handleSubmit = async () => {
    try {
      const payload = {
        ...form,
        latitude: parseFloat(form.lat),
        longitude: parseFloat(form.lng),
        tournee_id: tourneeId
      }
      const id = point?.ID || pointArret?.ID
      if (id) {
        await updatePointArret(id, payload)
      } else {
        await ajouterPointArret(payload)
      }
      onClose()
      onUpdated?.()
    } catch (e: any) {
      console.error('Erreur enregistrement point :', e)
      alert('Erreur : ' + (e.message || 'Impossible d’enregistrer le point'))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto !max-w-6xl">
        <DialogHeader>
          <DialogTitle>{point || pointArret ? 'Modifier le point d’arrêt' : 'Nouveau point d’arrêt'}</DialogTitle>
        </DialogHeader>
        <form className="space-y-4 mt-2">
          <div>
            <Label htmlFor="nom">Nom</Label>
            <Input name="nom" value={form.nom} onChange={handleChange} />
          </div>
          <div>
            <Label htmlFor="adresse">Adresse</Label>
            <Input name="adresse" value={form.adresse} onChange={handleChange} />
          </div>

          <div className="mt-4">
            <Label className="block text-sm font-medium mb-1">Positionner sur la carte</Label>
            <CartePointArret
              latitude={parseFloat(form.lat) || 33.5}
              longitude={parseFloat(form.lng) || -7.6}
              onSelectPosition={(lat, lng) => {
                setForm(prev => ({
                  ...prev,
                  lat: lat.toString(),
                  lng: lng.toString()
                }))
              }}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="lat">Latitude</Label>
              <Input name="lat" value={form.lat} onChange={handleChange} />
            </div>
            <div>
              <Label htmlFor="lng">Longitude</Label>
              <Input name="lng" value={form.lng} onChange={handleChange} />
            </div>
          </div>

          <div className="pt-4 pb-6 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="button" onClick={handleSubmit} className="bg-green-600 text-white">
              Enregistrer
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default ModalEditionPointArret
