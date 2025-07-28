import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog'
import { Input } from '../../components/ui/input'
import { Button } from '../../components/ui/button'
import { fetchServices, ajouterServiceContrat, updateServiceContrat } from '../../lib/api'
import { toast } from 'react-toastify'

interface Props {
  contratId: string
  open: boolean
  onClose: () => void
  onSuccess: () => void
  serviceToEdit?: any
}

export default function ModalAjouterServiceContrat({ contratId, open, onClose, onSuccess, serviceToEdit }: Props) {
  const [servicesDispo, setServicesDispo] = useState<any[]>([])
  const [form, setForm] = useState({
    service_id: '',
    tarif_unitaire: '',
    unite_tarif: '',
    plafond_mensuel: '',
    km_step: '',                // <- ajout
    tarif_unitaire_step: '' 
  })

  useEffect(() => {
    if (open) {
      fetchServices().then(setServicesDispo)

      if (serviceToEdit) {
        setForm({
          service_id: serviceToEdit.service_id,
          tarif_unitaire: serviceToEdit.tarif_unitaire?.toString() || '',
          unite_tarif: serviceToEdit.unite_tarif || '',
          plafond_mensuel: serviceToEdit.plafond_mensuel?.toString() || '',
          km_step: serviceToEdit.km_step?.toString() || '',
          tarif_unitaire_step: serviceToEdit.tarif_unitaire_step?.toString() || ''
        })
      } else {
        setForm({
          service_id: '',
          tarif_unitaire: '',
          unite_tarif: '',
          plafond_mensuel: '',
          km_step: '',
          tarif_unitaire_step: ''
        })
      }
    }
  }, [open])

  useEffect(() => {
    if (form.service_id && servicesDispo.length > 0) {
      const selected = servicesDispo.find(s => s.id === form.service_id)
      if (selected?.unite_facturation) {
        setForm(prev => ({
          ...prev,
          unite_tarif: selected.unite_facturation
        }))
      }
    }
  }, [form.service_id, servicesDispo])

  const handleChange = (e: any) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async () => {
    const payload = {
      ...form,
      tarif_unitaire: parseFloat(form.tarif_unitaire),
      plafond_mensuel: form.plafond_mensuel ? parseFloat(form.plafond_mensuel) : null,
      km_step: form.km_step ? parseFloat(form.km_step) : null,
      tarif_unitaire_step: form.tarif_unitaire_step ? parseFloat(form.tarif_unitaire_step) : null
    }

    if (serviceToEdit?.id) {
      await updateServiceContrat(serviceToEdit.id, payload)
      toast.success('Service mis à jour avec succès')
    } else {
      await ajouterServiceContrat(contratId, payload)
      toast.success('Service ajouté avec succès')
    }

    onSuccess()
    onClose()
  }

  const selectedService = servicesDispo.find(s => s.id === form.service_id)
  const isOccasionnelParKm = selectedService?.code === 'OCCASIONNEL_PAR_KM'

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{serviceToEdit ? 'Modifier le service' : 'Ajouter un service'}</DialogTitle>
        </DialogHeader>


        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Service</label>
            <select
              name="service_id"
              value={form.service_id}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded mt-1"
              disabled={!!serviceToEdit}
            >
              <option value="">-- Choisir un service --</option>
              {servicesDispo.map(service => (
                <option key={service.id} value={service.id}>
                  {service.libelle}
                </option>
              ))}
            </select>
          </div>

          {isOccasionnelParKm && (
  <div className="flex gap-4">
    <div>
      <label className="text-sm font-medium text-gray-700">Pas (km)</label>
      <Input
        name="km_step"
        type="number"
        value={form.km_step}
        onChange={handleChange}
        placeholder="Ex: 20"
        className="mt-1"
        min={1}
      />
    </div>
    <div>
      <label className="text-sm font-medium text-gray-700">Tarif par pas</label>
      <Input
        name="tarif_unitaire_step"
        type="number"
        value={form.tarif_unitaire_step}
        onChange={handleChange}
        placeholder="Ex: 20"
        className="mt-1"
        min={0}
      />
    </div>
  </div>
)}

        {!isOccasionnelParKm && (
            <div>
              <label className="text-sm font-medium text-gray-700">Tarif unitaire</label>
              <Input
                name="tarif_unitaire"
                type="number"
                value={form.tarif_unitaire}
                onChange={handleChange}
                placeholder="Tarif unitaire"
                className="mt-1"
              />
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-gray-700">Unité de tarif</label>
            <Input
              name="unite_tarif"
              value={form.unite_tarif}
              readOnly
              placeholder="Unité de tarif"
              className="mt-1"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Plafond mensuel (optionnel)</label>
            <Input
              name="plafond_mensuel"
              type="number"
              value={form.plafond_mensuel}
              onChange={handleChange}
              placeholder="Plafond mensuel"
              className="mt-1"
            />
          </div>
        </div>

        <div className="text-right pt-4">
          <Button onClick={handleSubmit}>
            {serviceToEdit ? 'Mettre à jour' : 'Ajouter'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
