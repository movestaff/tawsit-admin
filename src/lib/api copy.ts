const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

if (!API_BASE_URL) {
  throw new Error('❌ VITE_API_BASE_URL non défini dans .env')
}

// 🔹 Utilitaire de délai d'attente
function timeout(ms: number) {
  return new Promise((_, reject) =>
    setTimeout(() => reject(new Error('⏳ Délai dépassé')), ms)
  )
}

// =======================TOURNEES=================
export async function fetchTournees() {
  const res = await fetch(`${API_BASE_URL}/tournees`)
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function ajouterTournee(tournee: any) {
  const res = await fetch(`${API_BASE_URL}/tournees`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(tournee),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function updateTournee(id: string, tournee: any) {
  const res = await fetch(`${API_BASE_URL}/tournees/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(tournee),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function deleteTournee(id: string) {
  const res = await fetch(`${API_BASE_URL}/tournees/${id}`, {
    method: 'DELETE',
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

// ===================== conducteurs ====================
export async function fetchConducteurs() {
  const res = await fetch(`${API_BASE_URL}/tournees/conducteurs`)
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

// =======================EMPLOYES=================

export async function fetchEmployes() {
  const res = await fetch(`${API_BASE_URL}/employes`)
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function ajouterEmploye(employe: any) {
  const res = await fetch(`${API_BASE_URL}/employes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(employe),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function updateEmploye(id: string, employe: any) {
  const res = await fetch(`${API_BASE_URL}/employes/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(employe),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function deleteEmploye(id: string) {
  const res = await fetch(`${API_BASE_URL}/employes/${id}`, {
    method: 'DELETE',
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

//========================Affectations========================


export async function updateAffectation(id: string, payload: { type: 'fixe' | 'flexible', point_arret_id?: string, ordre_embarquement?: number }) {
  const response = await fetch(`${API_BASE_URL}/affectations/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  const data = await response.json()
  if (!response.ok) {
    throw new Error(data.error || 'Erreur lors de la mise à jour de l’affectation')
  }

  return data
}

// ✅ Récupère les affectations d’un employé
export async function fetchAffectationsEmploye(employeId: string) {
  const res = await fetch(`${API_BASE_URL}/affectations/${employeId}`)
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

// ✅ Supprime une affectation (selon le type)
export async function retirerAffectation(id: string, type: 'fixe' | 'flexible') {
  const res = await fetch(`${API_BASE_URL}/affectations/${id}?type=${type}`, {
    method: 'DELETE',
  })
  if (!res.ok) {
    const errText = await res.text()
    throw new Error(errText || 'Erreur lors de la suppression')
  }
  return res.json()
}

export async function ajouterAffectation(payload: {
  employe_id: string,
  type: 'fixe' | 'flexible',
  point_arret_id?: string,
  tournee_id: string,
  ordre_embarquement?: number
}) {
  const res = await fetch(`${API_BASE_URL}/affectations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(err || 'Erreur lors de l’affectation')
  }
  return res.json()
}

export async function fetchPointsArretParTournee(tourneeId: string) {
  const res = await fetch(`${API_BASE_URL}/points-arret?tournee_id=${tourneeId}`)
  if (!res.ok) throw new Error('Erreur lors du chargement des points d’arrêt')
  return res.json()
}
