import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog'
import { ScrollArea } from '../../components/ui/scroll-area'
import { Input } from '../../components/ui/input'
import { Button } from '../../components/ui/button'
import { affecterVehiculeService, fetchVehiculesSansService } from '../../lib/api'
import { LucideCheck, LucideX } from 'lucide-react'

interface ModalAffectationVehiculeProps {
  serviceId: string
  contratId: string
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function ModalAffectationVehiculeService({ serviceId, contratId, open, onClose, onSuccess }: ModalAffectationVehiculeProps) {
  const [vehicules, setVehicules] = useState<any[]>([])
  const [selection, setSelection] = useState<string[]>([])
  const [filtre, setFiltre] = useState('')

  const chargerVehicules = async () => {
    const data = await fetchVehiculesSansService(contratId)
    setVehicules(data)
  }

  useEffect(() => {
    if (open) {
      chargerVehicules()
    }
  }, [open])

  const toggleSelection = (vehiculeId: string) => {
    setSelection(prev =>
      prev.includes(vehiculeId) ? prev.filter(id => id !== vehiculeId) : [...prev, vehiculeId]
    )
  }

  const handleSubmit = async () => {
    for (const vehicule_id of selection) {
      await affecterVehiculeService({ vehicule_id, service_id: serviceId, contrat_id: contratId })
    }
    onSuccess()
    onClose()
  }

  const vehiculesFiltres = vehicules.filter(v => {
    const texte = `${v.libelle} ${v.immatriculation} ${v.marque}`.toLowerCase()
    return texte.includes(filtre.toLowerCase())
  })

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl">
        <DialogHeader>
          <DialogTitle>Affecter des véhicules au service</DialogTitle>
        </DialogHeader>

        <Input
          placeholder="Filtrer..."
          value={filtre}
          onChange={e => setFiltre(e.target.value)}
          className="mb-2"
        />

        <ScrollArea className="h-[400px] border rounded">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-3 py-2">Nom</th>
                <th className="px-3 py-2">Immatriculation</th>
                <th className="px-3 py-2">Marque</th>
                <th className="px-3 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {vehiculesFiltres.map(v => (
                <tr key={v.id} className="border-t">
                  <td className="px-3 py-2">{v.libelle}</td>
                  <td className="px-3 py-2">{v.immatriculation}</td>
                  <td className="px-3 py-2">{v.marque}</td>
                  <td className="px-3 py-2">
                    <button onClick={() => toggleSelection(v.id)}>
                      {selection.includes(v.id) ? <LucideCheck className="text-green-500" /> : <LucideX />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </ScrollArea>

        <div className="pt-4 text-right">
          <Button variant="primary" onClick={handleSubmit} disabled={selection.length === 0}>
            Affecter {selection.length} véhicule(s)
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
