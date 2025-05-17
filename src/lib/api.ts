const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

if (!API_BASE_URL) {
  throw new Error('❌ VITE_API_BASE_URL non défini dans .env')
}

export async function fetchTournees() {
  try {
    const res = await fetch(`${API_BASE_URL}/tournees`, {
      headers: { 'Accept': 'application/json' }
    })

    const contentType = res.headers.get('content-type') || ''
    if (!contentType.includes('application/json')) {
      throw new Error(`❌ Réponse non JSON (status: ${res.status})`)
    }

    const data = await res.json()

    if (!res.ok) {
      throw new Error(data.error || `Erreur API (${res.status})`)
    }

    return data
  } catch (err: any) {
    console.error('⛔ Erreur fetchTournees:', err)
    throw new Error(err.message || 'Erreur API inconnue')
  }
}

export async function fetchConducteurs() {
  const res = await fetch(`${API_BASE_URL}/tournees/conducteurs`)
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function ajouterTournee(data: any) {
  const res = await fetch(`${API_BASE_URL}/tournees`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })

  if (!res.ok) {
    const error = await res.text()
    throw new Error(error)
  }

  return await res.json()
}

export async function updateTournee(id: string, donnees: any) {
  const res = await fetch(`${API_BASE_URL}/tournees/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(donnees)
  })

  if (!res.ok) throw new Error(await res.text())
  return res.json()
}


export async function deleteTournee(id: string) {
  const res = await fetch(`${API_BASE_URL}/tournees/${id}`, {
    method: 'DELETE'
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(text)
  }
}
