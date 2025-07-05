import React, { useEffect, useState } from 'react'
import { fetchTournees, updateTournee } from '../lib/api'
import { Button } from './ui/button'
import { Trash, Plus } from 'lucide-react'
import ModalAjouterTourneeAuSite from './ModalAjouterTourneeAuSite'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { toast } from 'react-toastify'

const ModalTourneesLieesAuSite = ({ site }: { site: any }) => {
  const [tournees, setTournees] = useState<any[]>([])
  const [modalAjouter, setModalAjouter] = useState(false)

  const chargerTournees = async () => {
    try {
      const data = await fetchTournees()
      const liees = data.filter((t: any) => t.site_id === site.id)
      setTournees(liees)
    } catch (err: any) {
      toast.error(err.message || 'Erreur chargement tournées')
    }
  }

  useEffect(() => {
    chargerTournees()
  }, [site])

  const retirerTournee = async (id: string) => {
    if (!confirm('Retirer cette tournée du site ?')) return
    try {
      await updateTournee(id, { site_id: null })
      toast.success('Tournée dissociée')
      chargerTournees()
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors du retrait')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
      <Button onClick={() => setModalAjouter(true)} className="flex gap-2 items-center">
        <Plus className="w-4 h-4" /> Ajouter une tournée
      </Button>
       </div>
      
      <table className="min-w-full text-sm text-gray-800 border">
        <thead className="bg-secondary text-left font-semibold text-gray-700">
          <tr>
            <th className="px-4 py-2">Nom</th>
            <th className="px-4 py-2">Type</th>
            <th className="px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {tournees.map((t) => (
            <tr key={t.id} className="border-t">
              <td className="px-4 py-2">{t.nom}</td>
              <td className="px-4 py-2">{t.type}</td>
              <td className="px-4 py-2">
                <Button variant="ghost" size="sm" onClick={() => retirerTournee(t.id)}>
                  <Trash className="w-5 h-5 text-red-600" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      

      <Dialog open={modalAjouter} onOpenChange={setModalAjouter}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Affecter des tournées au site</DialogTitle>
          </DialogHeader>
          <ModalAjouterTourneeAuSite siteId={site.id} onAffectation={chargerTournees} />
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default ModalTourneesLieesAuSite
