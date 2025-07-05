export async function autoPlanTours({ date, recurrence, jours_semaine, jours_mois }: any) {
  const token = localStorage.getItem('token')
  const societe_id = localStorage.getItem('societe_id')

  const res = await fetch('/api/autoplan', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ date, recurrence, jours_semaine, jours_mois, societe_id })
  })

  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.error || 'Erreur lors de la planification')
  }

  return res.json()
}