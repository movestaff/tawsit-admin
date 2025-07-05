export interface Groupe {
  id: string
  nom: string
  heure_debut: string
  heure_fin: string
  recurrence_type: 'unique' | 'hebdomadaire' | 'mensuel'
  jours_semaine?: number[] | null
  jours_mois?: number[] | null
  site_id: string
  societe_id: string
  date_unique?: string | null
  type?: string
}

export interface Employe {
  ID: string
  nom: string
  prenom: string
  email?: string | null
  telephone?: string
  matricule?: string
  latitude: number
  longitude: number
  groupe_id: string
  groupe_id_retour?: string | null
}

export interface Vehicule {
  id: string
  capacite: number
  immatriculation: string
}

export interface ConducteurAffectation {
  conducteur_id: string
  vehicule_id: string
}

export interface Cluster {
  latitude: number
  longitude: number
  employes: string[]
  distance_max_m: number
  valide: boolean
  centre_estime: {
    lat: number
    lng: number
  }
  ordre: number
  vehicule: number
}

export interface Site {
  lat: number
  lng: number
  nom: string
}

export interface PreviewResult {
  date_reference: string
  groupes: Groupe[]
  employesByGroupe: Record<string, Employe[]>
  vehiculesDisponibles: Vehicule[]
  conducteursActifs: ConducteurAffectation[]
  clustersByGroupe: Record<string, Cluster[]>
  siteById: Record<string, Site>
}
