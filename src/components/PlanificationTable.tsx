import React, { useEffect, useState } from 'react'
import { fetchPlanifications } from '../lib/api'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Select } from '../components/ui/select'
import { Trash, Pencil, Copy, LayoutList, CalendarDays } from 'lucide-react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'

const PlanificationTable: React.FC = () => {
  const [planifications, setPlanifications] = useState<any[]>([])
  const [filtre, setFiltre] = useState({
    recherche: '',
    statut: '',
    type: '',
  })
  const [vue, setVue] = useState<'table' | 'calendrier'>('table')

  useEffect(() => {
    charger()
  }, [])

  const charger = async () => {
    const data = await fetchPlanifications()
    setPlanifications(data || [])
  }

  const filtered = planifications.filter(p => {
    const matchRecherche = filtre.recherche === '' || p.tournee?.nom?.toLowerCase().includes(filtre.recherche.toLowerCase())
    const matchStatut = filtre.statut === '' || (filtre.statut === 'actif' ? p.active : !p.active)
    const matchType = filtre.type === '' || p.recurrence_type === filtre.type
    return matchRecherche && matchStatut && matchType
  })

  const events = filtered.map(p => ({
    id: p.id,
    title: p.tournee?.nom || 'Tournée',
    start: p.date_unique ? `${p.date_unique}T${p.heure_depart}` : undefined,
    end: p.date_unique ? `${p.date_unique}T${p.heure_arrivee}` : undefined,
    extendedProps: p,
  })).filter(e => e.start)

  return (
    <div className="p-4">
      <div className="mb-4 flex gap-4 items-end justify-between">
        <div className="flex gap-2">
          <Input placeholder="🔍 Rechercher une tournée..." value={filtre.recherche} onChange={e => setFiltre(f => ({ ...f, recherche: e.target.value }))} />
          <Select value={filtre.type} onChange={e => setFiltre(f => ({ ...f, type: e.target.value }))}>
            <option value="">Tous types</option>
            <option value="unique">Unique</option>
            <option value="hebdomadaire">Hebdomadaire</option>
            <option value="mensuelle">Mensuelle</option>
          </Select>
          <Select value={filtre.statut} onChange={e => setFiltre(f => ({ ...f, statut: e.target.value }))}>
            <option value="">Tous statuts</option>
            <option value="actif">Actives</option>
            <option value="inactif">Inactives</option>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button variant={vue === 'table' ? 'primary' : 'outline'} onClick={() => setVue('table')}><LayoutList className="mr-2 h-4 w-4" /> Tableau</Button>
          <Button variant={vue === 'calendrier' ? 'primary' : 'outline'} onClick={() => setVue('calendrier')}><CalendarDays className="mr-2 h-4 w-4" /> Calendrier</Button>
        </div>
      </div>

      {vue === 'table' ? (
        <table className="w-full text-sm border shadow">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left px-2 py-1">Tournée</th>
              <th>Récurrence</th>
              <th>Départ</th>
              <th>Arrivée</th>
              <th>Statut</th>
              <th className="text-right px-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id} className="border-t hover:bg-gray-50">
                <td className="px-2 py-1">{p.tournee?.nom}</td>
                <td className="text-center">{p.recurrence_type}</td>
                <td className="text-center">{p.heure_depart}</td>
                <td className="text-center">{p.heure_arrivee}</td>
                <td className="text-center">
                  <span className={p.active ? 'text-green-600' : 'text-red-500'}>
                    {p.active ? 'Actif' : 'Inactif'}
                  </span>
                </td>
                <td className="px-2 text-right flex gap-2 justify-end">
                  <Button size="lg" variant="ghost"><Pencil size={36} /></Button>
                  <Button size="lg" variant="ghost"><Copy size={36} /></Button>
                  <Button size="lg" variant="ghost" className="text-red-600"><Trash size={36} /></Button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-6 text-gray-500">Aucune planification</td>
              </tr>
            )}
          </tbody>
        </table>
      ) : (
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
          }}
          events={events}
          height="auto"
        />
      )}
    </div>
  )
}

export default PlanificationTable
