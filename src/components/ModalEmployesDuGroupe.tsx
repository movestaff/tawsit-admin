import React, { useEffect, useState } from 'react'
import { getEmployesByGroupe, retirerEmployeDuGroupe } from '../lib/api'
import { Button } from './ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { Input } from './ui/input'
import { Plus, Trash } from 'lucide-react'
import ModalAjoutEmployesGroupe from './ModalAjoutEmployesGroupe'
import { toast } from 'react-toastify'

export default function ModalEmployesDuGroupe({ groupe, onClose }: any) {
  const [employes, setEmployes] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [showAjout, setShowAjout] = useState(false)

  const chargerEmployes = async () => {
    try {
      const data = await getEmployesByGroupe(groupe.id, groupe.type)
      setEmployes(data)
    } catch (err: any) {
      toast.error(err.message || 'Erreur de chargement des employés')
    }
  }

  useEffect(() => {
    if (groupe?.id) {
      chargerEmployes()
    }
  }, [groupe])

  const employesFiltres = employes.filter(e =>
    `${e.nom} ${e.prenom} ${e.email} ${e.service} ${e.departement}`.toLowerCase().includes(search.toLowerCase())
  )

  const handleRetirer = async (id: string) => {
    if (!groupe?.type) return
    try {
      await retirerEmployeDuGroupe(id, groupe.type)
      toast.success('Employé retiré')
      chargerEmployes()
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  return (
    <>
      <div className="mb-4 flex justify-between items-center">
        <Input placeholder="🔍 Rechercher employé..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-1/2" />
        <Button onClick={() => setShowAjout(true)} className="flex gap-2 items-center">
          <Plus className="w-4 h-4" /> Ajouter employé(s)
        </Button>
      </div>

      <div className="overflow-x-auto rounded border border-neutral bg-white shadow-sm">
        <table className="min-w-full text-sm text-gray-800">
          <thead>
            <tr className="bg-secondary text-left font-semibold text-gray-700">
              <th className="px-4 py-2">Nom</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Service</th>
              <th className="px-4 py-2">Département</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {employesFiltres.map((emp) => (
              <tr key={emp.ID} className="border-t hover:bg-secondary/80">
                <td className="px-4 py-2">{emp.nom} {emp.prenom}</td>
                <td className="px-4 py-2">{emp.email}</td>
                <td className="px-4 py-2">{emp.service}</td>
                <td className="px-4 py-2">{emp.departement}</td>
                <td className="px-4 py-2">
                  <Button size="sm" variant="ghost" onClick={() => handleRetirer(emp.ID)}>
                    <Trash className="w-5 h-5 text-red-600" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="text-xs text-gray-500 p-2">Total : {employesFiltres.length} employé(s)</p>
      </div>

      <Dialog open={showAjout} onOpenChange={setShowAjout}>
        <DialogContent className="w-full !max-w-5xl">
          <DialogHeader>
            <DialogTitle>Ajouter des employés au groupe</DialogTitle>
          </DialogHeader>
          <ModalAjoutEmployesGroupe
            groupe={groupe}
            onClose={() => {
              setShowAjout(false)
              chargerEmployes()
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}