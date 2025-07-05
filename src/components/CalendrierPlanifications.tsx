import React, { useMemo } from 'react'
import { Calendar, momentLocalizer, Views } from 'react-big-calendar'
import moment from 'moment'
import 'moment/locale/fr'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { toast } from 'react-toastify'

moment.locale('fr')
const localizer = momentLocalizer(moment)

interface CalendrierPlanificationsProps {
  planifications: any[]
  filtreTexte: string
  filtreType: string
  filtreStatut: string
}

function fusionnerDateEtHeure(dateStr: string, heureStr: string): Date {
  const [h, m] = (heureStr || '00:00').split(':').map(Number)
  const d = new Date(dateStr)
  d.setHours(h || 0, m || 0, 0, 0)
  return d
}

function genererEvenements(planifications: any[]): any[] {
  const events: any[] = []
  const now = new Date()
  const dans30Jours = new Date()
  dans30Jours.setDate(now.getDate() + 30)

  planifications.forEach(plan => {
    const base = {
      resource: {
        id: plan.id,
        statut: plan.active ? 'active' : 'inactif',
        tournee_id: plan.tournee_id,
        conducteur: plan.conducteur || null
      },
      title: plan.tournee?.nom || 'Tournée',
    }

    if (plan.recurrence_type === 'unique' && plan.date_unique) {
      const start = fusionnerDateEtHeure(plan.date_unique, plan.heure_depart)
      const end = plan.heure_arrivee
        ? fusionnerDateEtHeure(plan.date_unique, plan.heure_arrivee)
        : new Date(start.getTime() + 2 * 60 * 60 * 1000)
      events.push({ ...base, start, end })
    }

    if (plan.recurrence_type === 'hebdomadaire' && Array.isArray(plan.jours_semaine)) {
      const jours = plan.jours_semaine.map((j: string) => j.toLowerCase())
      const jourIndex = {
        'lundi': 1, 'mardi': 2, 'mercredi': 3, 'jeudi': 4,
        'vendredi': 5, 'samedi': 6, 'dimanche': 0
      }

      for (let d = new Date(now); d <= dans30Jours; d.setDate(d.getDate() + 1)) {
        const jourNom = d.toLocaleDateString('fr-FR', { weekday: 'long' }).toLowerCase()
        if (jours.includes(jourNom)) {
          const dateStr = d.toISOString().split('T')[0]
          const start = fusionnerDateEtHeure(dateStr, plan.heure_depart)
          const end = plan.heure_arrivee
            ? fusionnerDateEtHeure(dateStr, plan.heure_arrivee)
            : new Date(start.getTime() + 2 * 60 * 60 * 1000)
          events.push({ ...base, start: new Date(start), end: new Date(end) })
        }
      }
    }

    if (plan.recurrence_type === 'mensuelle' && Array.isArray(plan.jours_mois)) {
      const jours = plan.jours_mois.map(Number)
      const maintenant = new Date()
      const moisActuel = maintenant.getMonth()

      for (let m = 0; m < 2; m++) {
        const mois = new Date(maintenant.getFullYear(), moisActuel + m, 1)
        jours.forEach((jour: number) => {
          const d = new Date(mois.getFullYear(), mois.getMonth(), jour)
          if (d >= now && d <= dans30Jours) {
            const dateStr = d.toISOString().split('T')[0]
            const start = fusionnerDateEtHeure(dateStr, plan.heure_depart)
            const end = plan.heure_arrivee
              ? fusionnerDateEtHeure(dateStr, plan.heure_arrivee)
              : new Date(start.getTime() + 2 * 60 * 60 * 1000)
            events.push({ ...base, start: new Date(start), end: new Date(end) })
          }
        })
      }
    }
  })

  return events
}

const CalendrierPlanifications: React.FC<CalendrierPlanificationsProps> = ({ planifications, filtreTexte, filtreType, filtreStatut }) => {
  const texte = (filtreTexte ?? '').toLowerCase()

  const planFiltres = useMemo(() => planifications.filter(plan => {
    const nom = plan?.tournee?.nom?.toLowerCase?.() || ''
    const recurrence = plan?.recurrence_type?.toLowerCase?.() || ''
    const date = plan?.date_unique?.toLowerCase?.() || ''
    const js = Array.isArray(plan?.jours_semaine) ? plan.jours_semaine.join(', ').toLowerCase() : ''
    const jm = Array.isArray(plan?.jours_mois) ? plan.jours_mois.join(', ').toLowerCase() : ''
    const dep = plan?.heure_depart?.toLowerCase?.() || ''
    const arr = plan?.heure_arrivee?.toLowerCase?.() || ''
    const statut = plan?.active ? 'active' : 'inactif'

    const matchTexte = texte === '' ||
      nom.includes(texte) || recurrence.includes(texte) || date.includes(texte) ||
      js.includes(texte) || jm.includes(texte) || dep.includes(texte) || arr.includes(texte) ||
      statut.includes(texte)

    const matchType = filtreType === '' || plan.recurrence_type === filtreType
    const matchStatut = filtreStatut === '' ||
      (filtreStatut === 'active' && plan.active) ||
      (filtreStatut === 'inactive' && !plan.active)

    return matchTexte && matchType && matchStatut
  }), [planifications, texte, filtreType, filtreStatut])

  const events = useMemo(() => genererEvenements(planFiltres), [planFiltres])

  return (
    <div className="bg-white shadow rounded-lg p-4" style={{ minHeight: '600px' }}>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 600 }}
        views={['month', 'week', 'day', 'agenda']}
        defaultView="week"
        onSelectEvent={(event) => toast.info(`Tournée: ${event.title}`)}
        eventPropGetter={(event) => {
          const bg = event.resource?.statut === 'active' ? '#22c55e' : '#f87171'
          return { style: { backgroundColor: bg, color: 'white' } }
        }}
        messages={{
          month: 'Mois', week: 'Semaine', day: 'Jour', agenda: 'Agenda',
          today: "Aujourd'hui", previous: 'Préc.', next: 'Suiv.',
          showMore: (total) => `+ ${total} de plus`
        }}
      />
    </div>
  )
}

export default CalendrierPlanifications
