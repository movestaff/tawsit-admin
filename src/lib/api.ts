import { useAuthStore } from '../store/authStore'
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL


if (!API_BASE_URL) {
  throw new Error('❌ VITE_API_BASE_URL non défini dans .env')
}


async function fetchWithAuth(url: string, options?: RequestInit) {
  const response = await fetch(url, options);

  if (response.status === 401) {
    console.warn('[API] ➜ 401 détecté ➜ Déconnexion forcée');
    useAuthStore.getState().logout();
    if (window.location.pathname !== '/') {
      window.location.href = '/';
    }
    throw new Error('Session expirée. Veuillez vous reconnecter.');
  }

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || 'Erreur inconnue');
  }

  return response.json();
}



// ✅ Injecte automatiquement le token et la société via les headers requis par le middleware backend
export function getAuthHeaders(contentType?: string) : Record<string, string> {
  const token = localStorage.getItem('token') || ''
  const societe_id = localStorage.getItem('selectedSocieteId') || ''
  const headers: Record<string, string> = {
    'Authorization': `Bearer ${token}`,
    'x-societe-id': societe_id
  }
  if (contentType) {
    headers['Content-Type'] = contentType
  }
  return headers
}

// ✅ Pour usage dans le body uniquement si nécessaire
function getSocieteId() {
  return localStorage.getItem('selectedSocieteId') || ''
}



// ===== Utilitaire de délai d'attente =====
function timeout(ms: number) {
  return new Promise((_, reject) =>
    setTimeout(() => reject(new Error('⏳ Délai dépassé')), ms)
  )
}

// ================== TOURNEES ==================
export async function fetchTournees() {
  return fetchWithAuth(`${API_BASE_URL}/tournees`, {
    method: 'GET',
    headers: getAuthHeaders('application/json'),
  });
}

export async function ajouterTournee(tournee: any) {
  const res = await fetch(`${API_BASE_URL}/tournees`, {
    method: 'POST',
    headers: getAuthHeaders('application/json'),
    body: JSON.stringify(tournee),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}
export async function updateTournee(id: string, tournee: any) {
  const res = await fetch(`${API_BASE_URL}/tournees/${id}`, {
    method: 'PATCH',
    headers: getAuthHeaders('application/json'),
    body: JSON.stringify(tournee),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}


export async function deleteTournee(id: string) {
  const res = await fetch(`${API_BASE_URL}/tournees/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders('application/json')
  })
  if (!res.ok) throw new Error(await res.text())
  return res.status === 204 ? true : res.json()
}

// ================== CONDUCTEURS ==================
// Liste des conducteurs pour les tournées
export async function fetchConducteurs() {
  return fetchWithAuth(`${API_BASE_URL}/tournees/conducteurs`, {
    method: 'GET',
    headers: getAuthHeaders('application/json'),
  })

}

export async function fetchConducteurGestion() {
  return fetchWithAuth(`${API_BASE_URL}/conducteurs`, {
    method: 'GET',
    headers: getAuthHeaders('application/json'),
  })
  //if (!res.ok) throw new Error(await res.text())
 // return res.json()
}



// Ajouter un conducteur
export async function ajouterConducteur(conducteur: any) {
  const res = await fetch(`${API_BASE_URL}/conducteurs`, {
    method: 'POST',
    headers: getAuthHeaders('application/json'),
    body: JSON.stringify(conducteur),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}
// Update conducteur
export async function updateConducteur(id: string, conducteur: any) {
  const res = await fetch(`${API_BASE_URL}/conducteurs/${id}`, {
    method: 'PATCH',
    headers: getAuthHeaders('application/json'),
    body: JSON.stringify(conducteur),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}
// Delete conducteur
export async function deleteConducteur(id: string) {
  const res = await fetch(`${API_BASE_URL}/conducteurs/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders('application/json'),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

// ================== AFFECTATIONS TOURNEES CONDUCTEUR ==================
// Liste tournées affectées
export async function fetchAffectationsConducteur(conducteurId: string) {
  const res = await fetch(`${API_BASE_URL}/affectations-conducteur/${conducteurId}`)
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}


// Retirer une affectation
export async function retirerAffectationConducteur(id: string) {
  const res = await fetch(`${API_BASE_URL}/affectations-conducteur/${id}`, {
    method: 'DELETE',
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}



// =======================EMPLOYES=================
export async function fetchEmployes() {
  return fetchWithAuth(`${API_BASE_URL}/employes`,{
     method: 'GET', 
     headers: getAuthHeaders('application/json') })
  //if (!res.ok) throw new Error(await res.text())
  //return res.json()
}
export async function ajouterEmploye(employe: any) {
  const res = await fetch(`${API_BASE_URL}/employes`, {
    method: 'POST',
    headers: getAuthHeaders('application/json'),
    body: JSON.stringify(employe),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}
export async function updateEmploye(id: string, employe: any) {
  const res = await fetch(`${API_BASE_URL}/employes/${id}`, {
    method: 'PATCH',
    headers: getAuthHeaders('application/json'),
    body: JSON.stringify(employe),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}
export async function deleteEmploye(id: string) {
  const res = await fetch(`${API_BASE_URL}/employes/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders('application/json'),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function fetchEmployeById(id: string) {
  const res = await fetch(`${API_BASE_URL}/employes/${id}`, {
    method: 'GET',
    headers: getAuthHeaders('application/json'),
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText);
  }
  return res.json(); // <-- NE PAS remettre await res.text() ailleurs
}
// =======================AFFECTATIONS EMPLOYE==================
export async function fetchAffectationsEmploye(employeId: string) {
  const res = await fetch(`${API_BASE_URL}/affectations/${employeId}`, {
    method: 'GET'
    , headers: getAuthHeaders('application/json'),})
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}
export async function ajouterAffectation(payload: {
  employe_id: string,
  type: 'fixe' | 'flexible',
  point_arret_id?: string,
  tournee_id: string,
  ordre_embarquement?: number
} ) {const res = await fetch(`${API_BASE_URL}/affectations`, {
    method: 'POST',
    headers: getAuthHeaders('application/json'),
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(err || 'Erreur lors de l’affectation')
  }
  return res.json()
}

export async function retirerAffectation(id: string, type: 'fixe' | 'flexible') {
  const res = await fetch(`${API_BASE_URL}/affectations/${id}?type=${type}`, {
    method: 'DELETE',
    headers: getAuthHeaders('application/json'),  
  })
  if (!res.ok) {
    const errText = await res.text()
    throw new Error(errText || 'Erreur lors de la suppression')
  }
  return res.json()
}
export async function updateAffectation(id: string, payload: { type: 'fixe' | 'flexible', point_arret_id?: string, ordre_embarquement?: number }) {
  const response = await fetch(`${API_BASE_URL}/affectations/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders('application/json'),
    body: JSON.stringify(payload),
  })
  const data = await response.json()
  if (!response.ok) {
    throw new Error(data.error || 'Erreur lors de la mise à jour de l’affectation')
  }
  return data
}

//=======employes par point d arret =======

export async function fetchEmployesAffectesParPointArret(pointArretId: string) {
  const url = `${API_BASE_URL}/affectations/point/${pointArretId}`
  console.log('➡️ Appel API:', url)

  const res = await fetch(url, {
    method: 'GET',
    headers: getAuthHeaders('application/json'),
  })

  console.log('⬅️ Statut de réponse:', res.status)

  if (!res.ok) {
    const err = await res.text()
    console.error('❌ Erreur API:', err)
    throw new Error(err || 'Erreur lors de la récupération des affectations')
  }

  const data = await res.json()
  console.log('✅ Données récupérées:', data)
  return data
}


// ================== AFFECTATIONS TOURNEES CONDUCTEUR ==================
/**
 * Récupère la liste des tournées affectées à un conducteur (champ conducteur_id)
 * Appelle l'endpoint : GET /tournees/conducteur/:conducteurId
 */
export async function fetchTourneesParConducteur(conducteurId: string) {
  const res = await fetch(`${API_BASE_URL}/tournees/conducteur/${conducteurId}`,{
    method: 'GET',
    headers: getAuthHeaders('application/json'),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

/**
 * Récupère la liste des tournées NON affectées à un conducteur (conducteur_id null)
 * Appelle l'endpoint : GET /tournees/disponibles
 */
export async function fetchTourneesDisponibles() {
  const res = await fetch(`${API_BASE_URL}/tournees/disponibles`,{
    method: 'GET',
    headers: getAuthHeaders('application/json'),
  } )
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

/**
 * Affecte une tournée à un conducteur
 * PATCH /tournees/:tourneeId/affecter { conducteur_id }
 */
export async function affecterTourneeConducteur(tourneeId: string, conducteurId: string) {
  const res = await fetch(`${API_BASE_URL}/tournees/${tourneeId}/affecter`, {
    method: 'PATCH',
    headers: getAuthHeaders('application/json'),
    body: JSON.stringify({ conducteur_id: conducteurId }),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

/**
 * Retire une tournée d’un conducteur (remet conducteur_id à NULL)
 * PATCH /tournees/:tourneeId/retirer
 */
export async function retirerTourneeConducteur(tourneeId: string) {
  const res = await fetch(`${API_BASE_URL}/tournees/${tourneeId}/retirer`, {
    method: 'PATCH',
    headers: getAuthHeaders('application/json'),
    body: JSON.stringify({}),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

//=========================================================


// 🔐 Fonction de login pour l'application web
export async function loginWeb(email: string, password: string) {
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/authM/login-multi`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password })
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data?.error || 'Erreur lors de la connexion')
  }

  

  return data
}


//=======================Affectation tournee/ point d'arrêt à un employé========================================

export async function ajouterAffectationEmploye(payload: any) {
  const res = await fetch(`${API_BASE_URL}/affectations`, {
    method: 'POST',
    headers: getAuthHeaders('application/json'), // ✅ Inclut token + x-societe-id
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || 'Erreur lors de l’affectation')
  }

  return res.json()
}

// ✅ Récupération des tournées avec authentification
export async function fetchTourneesAvecAuth() {
  const res = await fetch(`${API_BASE_URL}/tournees`, {
    method: 'GET',
    headers: getAuthHeaders('application/json'), // inclut token + x-societe-id
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

// ✅ Récupération des points d’arrêt pour une tournée donnée
export async function fetchPointsArretAvecAuth(tourneeId: string) {
  if (!tourneeId || typeof tourneeId !== 'string' || tourneeId.trim() === '' || tourneeId === 'undefined') {
    throw new Error('tournee_id non valide')
  }

  const url = `${API_BASE_URL}/points-arret?tournee_id=${encodeURIComponent(tourneeId)}`

  const res = await fetch(url, {
    method: 'GET',
    headers: getAuthHeaders('application/json'),
  })

  if (!res.ok) {
    let errorMsg = 'Erreur inconnue'
    try {
      const errorJson = await res.json()
      errorMsg = JSON.stringify(errorJson)
    } catch (e) {
      errorMsg = await res.text()
    }
    throw new Error(errorMsg)
  }

  return res.json()
}

//===get employes non affectes par tournee par groupe =========
export async function fetchEmployesNonAffectesParTournee(tourneeId: string) {
  const url = `${API_BASE_URL}/affectations/non-affectes?tournee_id=${tourneeId}`

  const res = await fetch(url, {
    method: 'GET',
    headers: getAuthHeaders('application/json'),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(err || 'Erreur lors du chargement des employés non affectés')
  }

  return await res.json()
}


// ✅ Récupération des employés affectés à une tournée flexible
export async function getEmployesAffectesParTournee(tournee_id: string) {
  const res = await fetch(`${API_BASE_URL}/affectations/tournee/${tournee_id}`, {
    method: 'GET',
    headers: getAuthHeaders(), // inclut Authorization + x-societe-id
  })

  if (!res.ok) {
    const error = await res.text()
    throw new Error(error || 'Erreur lors de la récupération des employés affectés')
  }

  return res.json()
}

// ================== UPLOAD PHOTO EMPLOYE ==================
// 🔼 Uploader une photo d'employé via l'API sécurisée
export const uploadPhotoEmploye = async (employeId: string, file: File): Promise<string> => {
  const token =
    JSON.parse(localStorage.getItem('supabase.auth.token') || '{}')?.currentSession?.access_token ||
    useAuthStore.getState().token

  const societeId = useAuthStore.getState().selectedSocieteId

  if (!token || !societeId) {
    throw new Error("Authentification ou société non disponible")
  }

  const formData = new FormData()
  formData.append('photo', file)

  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/employes/${employeId}/photo`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'x-societe-id': societeId,
    },
    body: formData,
  })

  const result = await response.json()

  if (!response.ok) {
    throw new Error(result.error || 'Échec du téléversement')
  }

  return result.photoPath
}


// 🔽 Récupère l’URL de la photo d’un employé depuis l’API (proxy sécurisé)
export const getPhotoEmployeUrl = (employeId: string) => {
  return `${import.meta.env.VITE_API_BASE_URL}/employes/${employeId}/photo`
}

export const fetchPhotoEmployeAsBlob = async (id: string): Promise<string> => {
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/employes/${id}/photo`, {
    headers: getAuthHeaders(),
  })
console.log('📡 fetch appel')
  if (!response.ok) throw new Error('Erreur lors du chargement de la photo')

  const blob = await response.blob()
  return URL.createObjectURL(blob)
}

// ================== UPLOAD PHOTO conducteur ============================== ==================

export const uploadPhotoConducteur = async (conducteurId: string, file: File): Promise<string> => {
  const token =
    JSON.parse(localStorage.getItem('supabase.auth.token') || '{}')?.currentSession?.access_token ||
    useAuthStore.getState().token

  const societeId = useAuthStore.getState().selectedSocieteId

  if (!token || !societeId) {
    throw new Error("Authentification ou société non disponible")
  }

  const formData = new FormData()
  formData.append('photo', file)

  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/conducteurs/${conducteurId}/photo`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'x-societe-id': societeId,
    },
    body: formData,
  })

  const result = await response.json()

  if (!response.ok) {
    throw new Error(result.error || 'Échec du téléversement')
  }

  return result.photoPath
}


// 🔽 Récupère l’URL de la photo d’un conducteur depuis l’API (proxy sécurisé)
export const getPhotoConducteurUrl = (conducteurId: string) => {
  return `${import.meta.env.VITE_API_BASE_URL}/conducteurs/${conducteurId}/photo`
}

export const fetchPhotoConducteurAsBlob = async (id: string): Promise<string> => {
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/conducteurs/${id}/photo`, {
    headers: getAuthHeaders(),
  })
console.log('📡 fetch appel')
  if (!response.ok) throw new Error('Erreur lors du chargement de la photo')

  const blob = await response.blob()
  return URL.createObjectURL(blob)
}



// ================================✅ POINTS D'ARRET – API================================================


// ✅ Ajouter un point d’arrêt
export const ajouterPointArret = async (point: any) => {
  const res = await fetch(`${API_BASE_URL}/points-arret`, {
    method: 'POST',
    headers: getAuthHeaders('application/json'),
    body: JSON.stringify(point),
  })

  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || 'Erreur lors de l’ajout du point')
  }

  return await res.json()
}

// ✅ Modifier un point d’arrêt
export const updatePointArret = async (id: string, data: any) => {
  const res = await fetch(`${API_BASE_URL}/points-arret/${id}`, {
    method: 'PATCH',
    headers: getAuthHeaders('application/json'),
    body: JSON.stringify(data),
  })

  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || 'Erreur lors de la mise à jour du point')
  }

  return await res.json()
}

// ✅ Supprimer un point d’arrêt
export const deletePointArret = async (id: string) => {
  const res = await fetch(`${API_BASE_URL}/points-arret/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders('application/json'),
  })

  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || 'Erreur lors de la suppression du point')
  }

  return true
}

// ✅ Récupérer les points d’arrêt liés à une tournée
export const fetchPointsArretParTournee = async (tourneeId: string) => {
  const res = await fetch(`${API_BASE_URL}/points-arret?tournee_id=${tourneeId}`, {
    method: 'GET',
    headers: getAuthHeaders('application/json'),
  })

  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || 'Erreur lors du chargement des points d’arrêt')
  }

  return await res.json()
}
 // ✅ Récupérer tous les points d’arrêt
export async function fetchPointsArret() {
  const res = await fetch(`${API_BASE_URL}/points-arret`, {
    method: 'GET',
    headers: getAuthHeaders('application/json'), // inclut token + x-societe-id
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}


//=====================Geocoding Adresse========================
export async function geocodeAdresse(adresse: string): Promise<{ lat: number, lng: number } | null> {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(adresse)}`
  const res = await fetch(url)
  const data = await res.json()

  if (data && data.length > 0) {
    return {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon)
    }
  }

  return null
}


//=================recupérer les positions des conducteurs========================

export async function fetchPositionsConducteurs() {
   const res = await fetch(`${API_BASE_URL}/tournees/positions`,  {
    method: 'GET',
    headers: getAuthHeaders('application/json'), // inclut Authorization et x-societe-id
  })

  if (!res.ok) throw new Error(await res.text())
  return res.json()
}



// ================== PLANIFICATIONS ==================

/**
 * Récupère toutes les planifications (interface web admin)
 * GET /planifications/admin
 */
export async function fetchPlanifications() {
  return fetchWithAuth(`${API_BASE_URL}/planifications`, {
    method: 'GET',
    headers: getAuthHeaders('application/json'),
  })
  //if (!res.ok) throw new Error(await res.text())
 // return res.json()
}


export async function fetchGroupesDejaPlanifies() {
  const res = await fetch(`${API_BASE_URL}/planification/groupes-actifs`, {
    method: 'GET',
    headers: getAuthHeaders('application/json'),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}
/**
 * Ajoute une nouvelle planification
 * POST /planifications/admin
 */
export async function ajouterPlanification(planifObj: any) {
  const res = await fetch(`${API_BASE_URL}/planifications`, {
    method: 'POST',
    headers: getAuthHeaders('application/json'),
    body: JSON.stringify(planifObj),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || 'Erreur lors de l’ajout de la planification')
  }
  return res.json()
}

/**
 * Met à jour une planification
 * PUT /planifications/admin/:id
 */
export async function updatePlanification(id: string, planification: any) {
  const res = await fetch(`${API_BASE_URL}/planifications/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders('application/json'),
    body: JSON.stringify(planification),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || 'Erreur lors de la mise à jour de la planification')
  }
  return res.json()
}

/**
 * Supprime une planification
 * DELETE /planifications/admin/:id
 */
export async function deletePlanification(id: string) {
  const res = await fetch(`${API_BASE_URL}/planifications/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders('application/json'),
  })
  if (!res.ok) throw new Error(await res.text())
  return true
}




/**
 * Active ou désactive une planification
 * PATCH /planifications/admin/:id/toggle
 */
export async function togglePlanification(id: string, active: boolean) {
  const res = await fetch(`${API_BASE_URL}/planifications/${id}/toggle`, {
    method: 'PATCH',
    headers: getAuthHeaders('application/json'),
    body: JSON.stringify({ active }),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || 'Erreur lors de l’activation/désactivation')
  }
  return res.json()
}


export async function autoPlanTours({ date, recurrence, jours_semaine, jours_mois }: any) {
  const token = localStorage.getItem('token')
  const societe_id = localStorage.getItem('societe_id')

  const res = await fetch(`${API_BASE_URL}/autoplan`, {
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

export async function autoPlanifier({
  groupe_ids,
  vehicule_ids,
  date_reference
}: { groupe_ids: string[]; vehicule_ids: string[]; date_reference: string }) {
  const res = await fetch(`${API_BASE_URL}/auto-plan`, {
    method: 'POST',
    headers: getAuthHeaders('application/json'),
    body: JSON.stringify({
      groupe_ids,
      vehicule_ids,
      date_reference
    }),
  });
  
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}


export async function previewAutoPlan(payload: {
  groupe_ids: string[];
  vehicule_ids: string[];
  date_reference?: string;
}) {
  const res = await fetch(`${API_BASE_URL}/auto-plan-preview`, {
    method: 'POST',
    headers: getAuthHeaders('application/json'),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Erreur previewAutoPlan: ${err}`);
  }

  return res.json();
}

export async function confirmAutoPlan(payload: {
   clustersByGroupe: any;
  dateReference: string;
  groupes: any;
  employesByGroupe: any;
  vehiculesDisponibles: any;
  conducteursActifs: any;
  siteById: any;
}) {
  const res = await fetch(`${API_BASE_URL}/auto-plan-confirm`, {
    method: 'POST',
    headers: getAuthHeaders('application/json'),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Erreur confirmAutoPlan: ${err}`);
  }

  return res.json();
}


export async function fetchVehiculesDisponiblesPourPlanning(planning: {
  date: string,
  heure_debut: string,
  heure_fin: string,
  recurrence_type: string,
  jours_semaine?: string[],
  jours_mois?: number[],
  date_unique?: string
}) {
  const res = await fetch(`${API_BASE_URL}/auto-Plan/getVehiculesDisponiblesPourPlanning`, {
    method: 'POST',
    headers: getAuthHeaders('application/json'),
    body: JSON.stringify({ planning }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Erreur fetchVehiculesDisponiblesPourPlanning: ${err}`);
  }
  return res.json();
}



//====================================================================================================
//========================== ================== SITES ==================
export async function fetchSites() {
  return fetchWithAuth(`${API_BASE_URL}/site`, {
    method: 'GET',
    headers: getAuthHeaders('application/json')
  })
  
}


export async function ajouterSite(site: any) {
  const res = await fetch(`${API_BASE_URL}/site`, {
    method: 'POST',
    headers: getAuthHeaders('application/json'),
    body: JSON.stringify(site)
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function updateSite(id: string, site: any) {
  const res = await fetch(`${API_BASE_URL}/site/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders('application/json'),
    body: JSON.stringify(site)
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function deleteSite(id: string) {
  const res = await fetch(`${API_BASE_URL}/site/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders('application/json')
  })
  if (!res.ok) throw new Error(await res.text())
  return res
}

///=====================Groupe Employe==============================

export async function fetchGroupesEmployes(search = '') {
  const res = await fetch(`${API_BASE_URL}/groupes-employes?search=${encodeURIComponent(search)}`, {
    method: 'GET',
    headers: getAuthHeaders('application/json'),
  })
  if (!res.ok) throw new Error(await res.text())
  const groupes = await res.json()
  return groupes.map((groupe: any) => ({
    ...groupe,
    site_nom: groupe.site?.nom || '',
  }))
}



export async function createOrUpdateGroupeEmployes(payload: Record<string, any>) {
  const res = await fetch(`${API_BASE_URL}/groupes-employes`, {
    method: 'POST',
    headers: getAuthHeaders('application/json'),
    body: JSON.stringify(payload)
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}


export async function deleteGroupeEmployes(id: string) {
  const res = await fetch(`${API_BASE_URL}/groupes-employes/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders('application/json'),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function getEmployesByGroupe(groupe_id: string, type: 'départ' | 'retour') {
  const res = await fetch(`${API_BASE_URL}/groupes-employes/${groupe_id}/employes?type=${type}`, {
    method: 'GET',
    headers: getAuthHeaders('application/json'),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function retirerEmployeDuGroupe(employe_id: string, type: 'départ' | 'retour') {
  const res = await fetch(`${API_BASE_URL}/groupes-employes/retirer-employe/${employe_id}?type=${type}`, {
    method: 'DELETE',
    headers: getAuthHeaders('application/json'),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function ajouterEmployesAuGroupe(payload: { employe_ids: string[], groupe_id: string, type: 'départ' | 'retour' }) {
  const res = await fetch(`${API_BASE_URL}/groupes-employes/ajouter-employes`, {
    method: 'POST',
    headers: getAuthHeaders('application/json'),
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}


export async function fetchEmployesGroupe() {
  return fetchWithAuth(`${API_BASE_URL}/employes`, {
    method: 'GET',
    headers: getAuthHeaders('application/json'),
  })}
  

//=================================gestion vehicule =============================================

// Liste des véhicules
export async function fetchVehicules() {
  return fetchWithAuth(`${API_BASE_URL}/vehicules`, {
    method: 'GET'
    , headers: getAuthHeaders('application/json'),})
}


// Ajouter un véhicule (optionnel)
export async function ajouterVehicule(vehicule: any) {
  const res = await fetch(`${API_BASE_URL}/vehicules`, {
    method: 'POST',
    headers: getAuthHeaders('application/json'),
    body: JSON.stringify(vehicule),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function updateVehicule(id: string, vehicule: any) {
  const res = await fetch(`${API_BASE_URL}/vehicules/${id}`, {
    method: 'PATCH',
    headers: getAuthHeaders('application/json'),
    body: JSON.stringify(vehicule),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}


export async function deleteVehicule(id: string) {
  const res = await fetch(`${API_BASE_URL}/vehicules/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders('application/json'),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}


export async function fetchStatutsVehicules() {
  return fetchWithAuth(`${API_BASE_URL}/vehicules/statuts`, {
    method: 'GET',
    headers: getAuthHeaders('application/json'),
  })
  
}


// Liste des véhicules affectés à un conducteur
export async function fetchVehiculesAffectes(conducteurId: string) {
  return fetchWithAuth(`${API_BASE_URL}/conducteur-vehicule/${conducteurId}`, {
    method: 'GET'
    , headers: getAuthHeaders('application/json'),})
  
}


// Affecter véhicule à conducteur
export async function affecterVehiculeConducteur(payload: { conducteur_id: string, vehicule_id: string }) {
  const res = await fetch(`${API_BASE_URL}/conducteur-vehicule`, {
    method: 'POST',
    headers: getAuthHeaders('application/json'),
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(err || 'Erreur lors de l’affectation véhicule')
  }
  return res.json()
}


// supprimer affectation , ---> remplacer par ptch 

export async function retirerAffectationVehiculeConducteur(id: string) {
  const res = await fetch(`${API_BASE_URL}/conducteur-vehicule/${id}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}



export async function fetchHistoriqueAffectationsVehicule(vehiculeId: string) {
  return fetchWithAuth(`${API_BASE_URL}/conducteur-vehicule/vehicule/${vehiculeId}`, {
    headers: getAuthHeaders(),
  })
  
}



// ================== CONDUCTEURS DISPONIBLES POUR AFFECTATION ==================
export async function fetchConducteursDispoPourVehicule() {
  return fetchWithAuth(`${API_BASE_URL}/conducteur-vehicule/disponibles`, {
    method: 'GET',
    headers: getAuthHeaders('application/json'),
  })
  
}

// ================== AFFECTER CONDUCTEUR À VÉHICULE ==================
export async function affecterConducteurAVehicule(payload: {
  vehicule_id: string
  conducteur_id: string
  date_debut: string
}) {
  const res = await fetch(`${API_BASE_URL}/vehicules/affecter`, {
    method: 'POST',
    headers: getAuthHeaders('application/json'),
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}


// ================== CONTRATS PRESTATAIRES ==================

export async function fetchContrats() {
  return fetchWithAuth(`${API_BASE_URL}/contrats`, {
    method: 'GET',
    headers: getAuthHeaders('application/json')
  })
  
}

export async function createContrat(contrat: any) {
  const res = await fetch(`${API_BASE_URL}/contrats`, {
    method: 'POST',
    headers: getAuthHeaders('application/json'),
    body: JSON.stringify(contrat)
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function updateContrat(id: string, contrat: any) {
  const res = await fetch(`${API_BASE_URL}/contrats/${id}`, {
    method: 'PATCH',
    headers: getAuthHeaders('application/json'),
    body: JSON.stringify(contrat)
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function deleteContrat(id: string) {
  const res = await fetch(`${API_BASE_URL}/contrats/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders('application/json')
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function submitContrat(id: string) {
  const res = await fetch(`${API_BASE_URL}/contrats/${id}/submit`, {
    method: 'POST',
    headers: getAuthHeaders('application/json')
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function validerContrat(id: string) {
  const res = await fetch(`${API_BASE_URL}/contrats/${id}/valider`, {
    method: 'POST',
    headers: getAuthHeaders('application/json')
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function rejeterContrat(id: string, commentaire: string) {
  const res = await fetch(`${API_BASE_URL}/contrats/${id}/rejeter`, {
    method: 'POST',
    headers: getAuthHeaders('application/json'),
    body: JSON.stringify({ commentaire })
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function approveContrat(id: string) {
  const res = await fetch(`${API_BASE_URL}/contrats/${id}/approve`, {
    method: 'POST',
    headers: getAuthHeaders('application/json'),
  });

  if (!res.ok) throw new Error('Erreur lors de l’approbation du contrat');
  return res.json();
}

export async function demanderModificationContrat(id: string, payload: { objet: string; fichier_revision_url?: string }) {
  const res = await fetch(`${API_BASE_URL}/contrats/${id}/demande-modification`, {
    method: 'POST',
    headers: getAuthHeaders('application/json'),
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error('Erreur lors de la demande de modification');
  return res.json();
}

export async function fetchVehiculesContrat(contrat_id: string) {
   return fetchWithAuth(`${API_BASE_URL}/contrats/${contrat_id}/vehicules`, {
    method: 'GET',
    headers: getAuthHeaders('application/json')
  })

}

export async function affecterVehiculeContrat(payload: { contrat_id: string, vehicule_id: string }) {
  const res = await fetch(`${API_BASE_URL}/contrats/vehicules/affecter`, {
    method: 'POST',
    headers: getAuthHeaders('application/json'),
    body: JSON.stringify(payload)
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function retirerVehiculeContrat(contrat_vehicule_id: string) {
  const res = await fetch(`${API_BASE_URL}/contrats/vehicules/${contrat_vehicule_id}`, {
    method: 'PATCH',
    headers: getAuthHeaders('application/json')
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}



export async function fetchPrestataires() {
  return fetchWithAuth(`${API_BASE_URL}/prestataires`, {
    method: 'GET',
    headers: getAuthHeaders('application/json')
  })
 
}

//========================historique validations contrat =======
export async function fetchHistoriqueValidations(contratId: string) {
  return fetchWithAuth(`${API_BASE_URL}/contrats/${contratId}/historique-validations`, {
    method: 'GET',
    headers: getAuthHeaders('application/json'),
  })
  
}

export async function fetchRevisionsContrat(contratId: string) {
  return fetchWithAuth(`${API_BASE_URL}/contrats/${contratId}/revisions`, {
    method: 'GET',
    headers: getAuthHeaders('application/json'),
  })

}
//====================
export async function fetchVehiculesParPrestataire(
  prestataire_id: string,
  options: { sansContrat?: boolean } = {}
) {
  const params = new URLSearchParams()
  if (options.sansContrat) params.append('sansContrat', 'true')
  const url = `${API_BASE_URL}/contrats/prestataires/${prestataire_id}/vehicules?${params.toString()}`
  return fetchWithAuth(url, {
    method: 'GET',
    headers: getAuthHeaders('application/json')
  })
  
}


export async function desactiverContrat(contratId: string) {
  return fetchWithAuth(`${API_BASE_URL}/contrats/${contratId}/desactiver`, {
    method: 'PATCH',
    headers: getAuthHeaders('application/json'),
  });
}


export async function reactiverContrat(contratId: string) {
  const res = await fetch(`${API_BASE_URL}/contrats/${contratId}/reactiver`, {
    method: 'PATCH',
    headers: getAuthHeaders('application/json'),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}


// ========================gestion services contrats =============================

export async function fetchServicesContrat(contratId: string) {
  return fetchWithAuth(`${API_BASE_URL}/services?contrat_id=${contratId}`, {
    method: 'GET',
    headers: getAuthHeaders('application/json'),
  })
  
}

export async function ajouterServiceContrat(contratId: string, payload: any) {
  const res = await fetch(`${API_BASE_URL}/services?contrat_id=${contratId}`, {
    method: 'POST',
    headers: getAuthHeaders('application/json'),
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}


export async function desactiverServiceContrat (serviceContratId: string) {
  const res = await fetch(`${API_BASE_URL}/services/${serviceContratId}`, {
    method: 'DELETE',
    headers: getAuthHeaders('application/json'),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}


export async function retirerServiceContrat(serviceContratId: string) {
  const res = await fetch(`${API_BASE_URL}/services/${serviceContratId}`, {
    method: 'PATCH',
    headers: getAuthHeaders('application/json'),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}


export async function fetchServices() {
  return fetchWithAuth(`${API_BASE_URL}/services/services`, {
    method: 'GET',
    headers: getAuthHeaders('application/json'),
  });
 
}


// Affecter un véhicule à un service
export async function affecterVehiculeService(payload: any) {
  const res = await fetch(`${API_BASE_URL}/vehicules-service`, {
    method: 'POST',
    headers: getAuthHeaders('application/json'),
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

// Lister les véhicules d’un service
export async function getVehiculesParService(serviceId: string) {
  return fetchWithAuth(`${API_BASE_URL}/vehicules-service/service/${serviceId}`, {
    headers: getAuthHeaders('application/json'),
  })
  
}

// Lister les véhicules d’un prestataire
export async function getVehiculesParPrestataire(prestataireId: string) {
  return fetchWithAuth(`${API_BASE_URL}/vehicules-service/prestataire/${prestataireId}`, {
    headers: getAuthHeaders('application/json'),
  })
  
}

// Retirer un véhicule d’un service
export async function retirerVehiculeService(id: string) {
  const res = await fetch(`${API_BASE_URL}/vehicules-service/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders('application/json'),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function fetchVehiculesSansService(contratId: string) {
  const res = await fetch(`${API_BASE_URL}/vehicules-service/sans-service/${contratId}`, {
    method: 'GET',
    headers: getAuthHeaders('application/json'),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function updateServiceContrat(id: string, payload: any) {
  const res = await fetch(`${API_BASE_URL}/services/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders ('application/json'),
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error('Erreur mise à jour service');
  return res.json();
}


// ✅ Lister les documents d'un contrat
export async function fetchDocumentsContrat(contratId: any) {
  const res = await fetch(`${API_BASE_URL}/contrats/${contratId}/documents`, {
    method: 'GET',
    headers: getAuthHeaders('application/json')
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// ✅ Ajouter un document à un contrat
export const uploadDocumentContrat = async (contratId: string, file: File): Promise<any> => {
  const token =
    JSON.parse(localStorage.getItem('supabase.auth.token') || '{}')?.currentSession?.access_token ||
    useAuthStore.getState().token

  const societeId = useAuthStore.getState().selectedSocieteId

  if (!token || !societeId) {
    throw new Error("Authentification ou société non disponible")
  }
console.log('Document à uploader:', file);
  const formData = new FormData()
  formData.append('document', file)
  console.log('FormData:', formData.get('document'));

  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/contrats/${contratId}/documents`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'x-societe-id': societeId,
    },
    body: formData,
  })

  const result = await response.json()

  if (!response.ok) {
    throw new Error(result.error || 'Échec du téléversement')
  }

  return result
}


// ✅ Obtenir un document précis
export async function getDocumentContratById(documentId: any) {
  const res = await fetch(`${API_BASE_URL}/contrats/documents/${documentId}`, {
    method: 'GET',
    headers: getAuthHeaders('application/json')
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// ✅ Supprimer un document d'un contrat
export async function deleteDocumentContrat(documentId: any) {
  const res = await fetch(`${API_BASE_URL}/contrats/documents/${documentId}`, {
    method: 'DELETE',
    headers: getAuthHeaders('application/json')
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}


//======================================gestion facturation contrats========================================


export async function genererPeriodesContrat(contrat_id: string): Promise<{ message: string }> {
  const res = await fetch(`${API_BASE_URL}/periodes/generer/${contrat_id}`, {
    method: 'POST',
    headers: getAuthHeaders('application/json'),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(err || 'Erreur génération des périodes')
  }

  return res.json()
}



// ================== FACTURATION ==================

// ✅ Lister les périodes
export async function fetchPeriodes() {
  const res = await fetch(`${API_BASE_URL}/facturation/periodes`, {
    method: 'GET',
    headers: getAuthHeaders('application/json'),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

// ✅ Clôturer une période
export async function cloturerPeriode(periodeId: string) {
  const res = await fetch(`${API_BASE_URL}/facturation/periodes/${periodeId}/cloture`, {
    method: 'PATCH',
    headers: getAuthHeaders('application/json'),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

// ✅ Lister les montants d'une période
export async function fetchMontants(periodeId: string) {
  const url = `${API_BASE_URL}/facturation/montants?periode_id=${encodeURIComponent(periodeId)}`
  const res = await fetch(url, {
    method: 'GET',
    headers: getAuthHeaders('application/json'),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

// ✅ Lancer le calcul des montants
export async function calculerMontants(periodeId: string) {
  const res = await fetch(`${API_BASE_URL}/facturation/montants/calculate`, {
    method: 'POST',
    headers: getAuthHeaders('application/json'),
    body: JSON.stringify({ periode: periodeId })
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

// ✅ Valider des montants sélectionnés
export async function validerMontants(ids: string[]) {
  const res = await fetch(`${API_BASE_URL}/facturation/montants/validate`, {
    method: 'POST',
    headers: getAuthHeaders('application/json'),
    body: JSON.stringify({ montant_ids: ids }),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

// ✅ Créer un paiement
export async function creerPaiement(periodeId: string) {
  const res = await fetch(`${API_BASE_URL}/facturation/paiements`, {
    method: 'POST',
    headers: getAuthHeaders('application/json'),
    body: JSON.stringify({ periode_id: periodeId }),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

// ✅ Valider un paiement
export async function validerPaiement(paiementId: string) {
  const res = await fetch(`${API_BASE_URL}/facturation/paiements/${paiementId}/validate`, {
    method: 'PATCH',
    headers: getAuthHeaders('application/json'),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

// ✅ Marquer un paiement comme effectué
export async function marquerPaiementEffectue(paiementId: string, periodeId: string) {
  const res = await fetch(`${API_BASE_URL}/facturation/paiements/${paiementId}/effectuer`, {
    method: 'PATCH',
    headers: getAuthHeaders('application/json'),
    body: JSON.stringify({ periode_id: periodeId }),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

// ✅ Lister tous les paiements
export async function fetchPaiements() {
  const res = await fetch(`${API_BASE_URL}/facturation/paiements`, {
    method: 'GET',
    headers: getAuthHeaders('application/json'),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function annulerPaiement(paiementId: string) {
  const res = await fetch(`${API_BASE_URL}/facturation/paiements/${paiementId}/annuler`, {
    method: 'PATCH',
    headers: getAuthHeaders('application/json'),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}



//=============================gestion des prestataires =====================================

// Ajouter un prestataire
export async function ajouterPrestataire(data: Record<string, any>) {
  const res = await fetch(`${API_BASE_URL}/prestataires`, {
    method: 'POST',
    headers: getAuthHeaders('application/json'),
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || 'Erreur lors de la création du prestataire');
  }

  return await res.json();
}


// Modifier un prestataire
export async function updatePrestataire(id: string, data: any) {
  const response = await fetch(`${API_BASE_URL}/prestataires/${id}`, {
    method: 'PATCH',
    headers: getAuthHeaders('application/json'),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Erreur lors de la mise à jour du prestataire');
  }

  return await response.json();
}


// Supprimer un prestataire
export async function deletePrestataire(id: string) {
  const response = await fetch(`${API_BASE_URL}/prestataires/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders('application/json')
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Erreur lors de la suppression du prestataire');
  }

  return await response.json();
}

// =========================execution tournee==================================

export async function fetchExecutions() {
  return fetchWithAuth(`${API_BASE_URL}/executions`, {
    method: 'GET',
    headers: getAuthHeaders('application/json'),
  });
  //if (!res.ok) throw new Error(await res.text());
  //return res.json();
}

export async function fetchPlanificationById(id: string) {
  const res = await fetch(
    `${API_BASE_URL}/planifications/detail/${id}`,
    {
      method: 'GET',
      headers: getAuthHeaders('application/json'),
    }
  );
 if (!res.ok) throw new Error(await res.text());
  return res.json();
}



export async function fetchIncidentById(id: string) {
  const res = await fetch(`${API_BASE_URL}/incidents/${id}`, {
    method: 'GET',
    headers: getAuthHeaders('application/json'),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}


export async function createExecution(data: {
  tournee_id: string
  conducteur_id: string,
  id_planification: string,
  execution_parent_id?: string
}) {
  const response = await fetch(`${API_BASE_URL}/executions`, {
    method: 'POST',
    headers: getAuthHeaders('application/json'),
    body: JSON.stringify(data)
  })

  const result = await response.json()
  console.log('Envoi vers API:', data)
  if (!response.ok) {
    throw new Error(result.error || 'Erreur lors de la création de l’exécution')
  }

  return result
}

export async function updateExecutionStatus(executionId: string, statut: string) {
  const res = await fetch(`${API_BASE_URL}/executions/${executionId}/statut`, {
    method: 'PATCH',
    headers: getAuthHeaders('application/json'),
    body: JSON.stringify({ statut }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}


// Ajout au fichier api.ts

export async function fetchEmbarquementsByExecution(executionId: string) {
  const res = await fetch(`${API_BASE_URL}/embarquements/execution/${executionId}`, {
    method: 'GET',
    headers: getAuthHeaders('application/json'),
  });

  if (!res.ok) throw new Error(await res.text());
  return res.json();
}



//===================================================IA PROPOSAL ==========================================================================

// --- IA / VRP ---
export async function aiListSites() {
  const res = await fetch(`${API_BASE_URL}/ai/sites`, { headers: authHeaders() })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function aiSuggestRoutes(payload: { site_id: string; date: string; depart_time?: string }) {
  const res = await fetch(`${API_BASE_URL}/ai/suggest-routes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function aiGetProposal(id: string) {
  const res = await fetch(`${API_BASE_URL}/ai/proposals/${id}`, { headers: authHeaders() })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function aiAcceptProposal(id: string) {
  const res = await fetch(`${API_BASE_URL}/ai/proposals/${id}/accept`, {
    method: 'POST',
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

// util headers (si tu as déjà une fonction similaire, réutilise-la)
function authHeaders() {
  const token = localStorage.getItem('token') || ''
  const societeId = localStorage.getItem('societe_id') || ''
  return { Authorization: `Bearer ${token}`, 'x-societe-id': societeId }
}
