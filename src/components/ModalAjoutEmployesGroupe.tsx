import React, { useEffect, useState } from 'react'
import { fetchEmployesGroupe, ajouterEmployesAuGroupe } from '../lib/api'
import { Button } from './ui/button'
import { Checkbox } from './ui/checkbox'
import { Input } from './ui/input'
import { toast } from 'react-toastify'

type AjouterEmployesAuGroupeProps = {
  groupe: any
  onClose: () => void
}

export default function AjouterEmployesAuGroupe({ groupe, onClose }: AjouterEmployesAuGroupeProps) {
  const [employes, setEmployes] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [selection, setSelection] = useState<string[]>([])

  useEffect(() => {
    fetchEmployesGroupe()
      .then(setEmployes)
      .catch(() => toast.error('Erreur chargement employés'))
  }, [])

const filtered = employes.filter((e) =>
  (
    `${e.nom} ${e.prenom} ${e.email} ${e.matricule} ${e.service} ${e.departement}`.toLowerCase().includes(search.toLowerCase())
  ) &&
  ((groupe.type === 'depart' && !e.groupe_id) || (groupe.type === 'retour' && !e.groupe_id_retour))
)

  const toggleSelection = (id: string) => {
    setSelection((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  const handleSubmit = async () => {
    if (!selection.length) return
    try {
      await ajouterEmployesAuGroupe({ employe_ids: selection, groupe_id: groupe.id, type: groupe.type })
      toast.success('Employés ajoutés')
      onClose()
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  return (
    <div className="space-y-4">
      <Input
        placeholder="🔍 Rechercher par nom, matricule, service..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <div className="overflow-y-auto max-h-[400px] border rounded">
        <table className="min-w-full text-sm text-gray-800">
          <thead>
            <tr className="bg-secondary text-left font-semibold text-gray-700">
              <th className="px-4 py-2">#</th>
              <th className="px-4 py-2">Nom</th>
              <th className="px-4 py-2">Matricule</th>
              <th className="px-4 py-2">Service</th>
              <th className="px-4 py-2">Département</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((e) => (
              <tr key={e.ID} className="border-t hover:bg-secondary/80">
                <td className="px-4 py-2">
                  <Checkbox checked={selection.includes(e.ID)} onChange={() => toggleSelection(e.ID)} />
                </td>
                <td className="px-4 py-2">{e.nom} {e.prenom}</td>
                <td className="px-4 py-2">{e.matricule}</td>
                <td className="px-4 py-2">{e.service}</td>
                <td className="px-4 py-2">{e.departement}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="text-xs text-gray-500 p-2">Total : {filtered.length} employé(s)</p>
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onClose}>Annuler</Button>
        <Button onClick={handleSubmit}>Affecter au groupe</Button>
      </div>
    </div>
  )
}