import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog'
import { Button } from '../../components/ui/button'
import { ScrollArea } from '../../components/ui/scroll-area'
import { LucidePlusCircle, LucideX } from 'lucide-react'
import { getVehiculesParService, retirerVehiculeService } from '../../lib/api'
import ModalAffectationVehiculeService from '../contrat/ModalAffectationVehicule'
import { toast } from 'react-toastify'

interface ListeVehiculesContratProps {
  contratId: string
  serviceId: string
  open: boolean
  onClose: () => void
   statutValidation?: string
}

export default function ListeVehiculesContrat({ contratId, serviceId, open, onClose, statutValidation }: ListeVehiculesContratProps) {
  const [vehicules, setVehicules] = useState<any[]>([])
  const [modalAjoutOuverte, setModalAjoutOuverte] = useState(false)
  const lectureSeule = statutValidation === 'valide'

  const chargerVehicules = async () => {
    try {
      const data = await getVehiculesParService(serviceId)
      setVehicules(data)
    } catch (err) {
      console.error('Erreur chargement véhicules:', err)
    }
  }

  useEffect(() => {
    if (open) {
      chargerVehicules()
    }
  }, [open, serviceId])

  const retirerVehicule = async (id: string) => {
    if (confirm('Retirer ce véhicule du service ?')) {
      const res = await retirerVehiculeService(id)
      toast.success(res?.message || 'vehicule retire avec succès');
      chargerVehicules()
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="!max-w-6xl">
          <DialogHeader>
            <DialogTitle>Véhicules affectés au service</DialogTitle>
          </DialogHeader>

          <ScrollArea className="h-[400px]">
            <table className="w-full text-sm text-left border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-3 py-2">Immatriculation</th>
                  <th className="px-3 py-2">Modèle</th>
                  <th className="px-3 py-2">Marque</th>
                  <th className="px-3 py-2">Date affectation</th>
                  <th className="px-3 py-2">Fin</th>
                  <th className="px-3 py-2">Actif</th>
                  <th className="px-3 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {vehicules.map(v => (
                  <tr key={v.id} className="border-t">
                    <td className="px-3 py-2">{v.vehicule?.immatriculation}</td>
                    <td className="px-3 py-2">{v.vehicule?.modele}</td>
                    <td className="px-3 py-2">{v.vehicule?.marque}</td>
                    <td className="px-3 py-2">{v.date_affectation || '—'}</td>
                    <td className="px-3 py-2">{v.date_fin || '—'}</td>
                    <td className="px-3 py-2">{v.actif ? 'Oui' : 'Non'}</td>
                    <td className="px-3 py-2 text-right">
                  
                        <LucideX
                          className={`cursor-pointer text-red-500 ${lectureSeule ? 'opacity-50 pointer-events-none' : ''}`}
                          onClick={() => {
                            if (!lectureSeule) retirerVehicule(v.id)
                          }}
                        />
                      
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </ScrollArea>

          <div className="pt-4 text-right">
            {statutValidation !== 'valide' && (
            <Button variant="primary" onClick={() => setModalAjoutOuverte(true)}>
               Ajouter des véhicules
            </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {!lectureSeule && modalAjoutOuverte && (
        <ModalAffectationVehiculeService
          contratId={contratId}
          serviceId={serviceId}
          open={modalAjoutOuverte}
          onClose={() => setModalAjoutOuverte(false)}
          onSuccess={chargerVehicules}
        />
      )}
    </>
  )
}
