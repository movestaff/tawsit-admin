import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog'
import { Button } from '../../components/ui/button'
import { ScrollArea } from '../../components/ui/scroll-area'
import { LucidePlusCircle, LucideTruck, LucideTrash, Pencil } from 'lucide-react'
import { fetchServicesContrat, retirerServiceContrat } from '../../lib/api'
import ModalAjouterServiceContrat from './ModalAjouterServiceContrat'
import ListeVehiculesContrat from './ListeVehiculesContrat'
import { toast } from 'react-toastify'

interface ModalServicesContratProps {
  contratId: string
  open: boolean
  onClose: () => void
    statutValidation?: string 
    
}

export default function ModalServicesContrat({ contratId, open, onClose, statutValidation }: ModalServicesContratProps) {
  const [services, setServices] = useState<any[]>([])
  const [modalAjoutOuverte, setModalAjoutOuverte] = useState(false)
  const [serviceSelectionne, setServiceSelectionne] = useState<any>(null)
  const [serviceToEdit, setServiceToEdit] = useState<any>(null)
  const lectureSeule = statutValidation === 'valide'

  const chargerServices = async () => {
    try {
      const data = await fetchServicesContrat(contratId)
      setServices(data)
    } catch (err) {
      console.error('Erreur chargement services:', err)
    }
  }

 const handleDelete = async (id: string) => {
  if (!confirm('Supprimer ce service ?')) return;

  try {
    const res = await retirerServiceContrat(id);
    toast.success(res.message || 'Service supprimé avec succès');
    chargerServices(); // Rafraîchir la liste
  } catch (err: any) {
    console.error(err);
    toast.error(err?.message || 'Erreur suppression service');
  }
};

  useEffect(() => {
    if (open) {
      chargerServices()
    }
  }, [open, contratId])

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="!max-w-6xl">
          <DialogHeader>
            <DialogTitle>Services associés au contrat</DialogTitle>
          </DialogHeader>

          <ScrollArea className="h-[500px]">
            <table className="w-full text-sm text-left border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-3 py-2">Service</th>
                  <th className="px-3 py-2">Tarif</th>
                  <th className="px-3 py-2">Plafond mensuel</th>
                  <th className="px-3 py-2">Période</th>
                  <th className="px-3 py-2">Actif</th>
                  <th className="px-3 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {services.map(s => (
                  <tr key={s.id} className="border-t">
                    <td className="px-3 py-2">{s.service?.libelle}</td>
                    <td className="px-3 py-2">{s.tarif_unitaire} / {s.unite_tarif}</td>
                    <td className="px-3 py-2">{s.plafond_mensuel || '-'}</td>
                    <td className="px-3 py-2">{s.date_debut} → {s.date_fin}</td>
                    <td className="px-3 py-2">{s.actif ? 'Oui' : 'Non'}</td>
                    <td className="px-3 py-2 flex items-center gap-2">
                 
                        <LucideTruck className="cursor-pointer text-green-500"  onClick={() => setServiceSelectionne(s)}/>
                        <Pencil
                          className={`cursor-pointer text-blue-500${lectureSeule ? ' opacity-50 cursor-not-allowed' : ''}`}
                          onClick={() => {
                            if (!lectureSeule) {
                              setServiceToEdit(s)
                              setModalAjoutOuverte(true)
                            }
                          }}
                        />
                        <LucideTrash className="cursor-pointer text-red-500" onClick={() => handleDelete(s.id)}/>
                      
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </ScrollArea>

          <div className="pt-4 text-right">
            {statutValidation !== 'valide' &&(
            <Button variant="primary" onClick={() => setModalAjoutOuverte(true)}>
               Ajouter un service
            </Button>
           ) }


          </div>
        </DialogContent>
      </Dialog>

      {modalAjoutOuverte && (
  <ModalAjouterServiceContrat
    contratId={contratId}
    open={modalAjoutOuverte}
    onClose={() => {
      setModalAjoutOuverte(false)
      setServiceToEdit(null)
    }}
    onSuccess={() => {
      chargerServices()
      setServiceToEdit(null)
    }}
    serviceToEdit={serviceToEdit}
  />
)}

      {serviceSelectionne && (
        <ListeVehiculesContrat
          contratId={contratId}
          serviceId={serviceSelectionne.service_id}
          open={!!serviceSelectionne}
          onClose={() => setServiceSelectionne(null)}
           statutValidation={statutValidation}
        />
      )}
    </>
  )
}
