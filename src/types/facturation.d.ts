export interface Periode {
  contrat: any
  id: string
  label: string
  date_debut: string
  date_fin: string
  statut: 'ouverte' | 'calculée' | 'payée' | 'clôturée'
  societe_id: string
}

export interface Montant {
  id: string
  montant_ttc: number
  statut: 'provisoire' | 'valide' | 'payé'
  periode_id: string
  contrat_id: string
  service_id: string

  contrats_prestataires?: {
    numero_contrat?: string
    prestataires?: {
      nom?: string
    }
  }

  services?: {
    code?: string
  }
}

export interface Paiement {
  id: string
  montant: number
  date_paiement: string
  periode: string
  statut: 'brouillon' | 'validé' | 'effectué' | 'annulé'
  societe_id?: string

  periodes_facturation?: {
    id: string
    label: string
  } | null

  contrats_prestataires?: {
    numero_contrat?: string
    prestataires?: {
      nom?: string
    }
  }
}


export interface ContratPrestataire {
  numero_contrat?: string
  prestataires?: Prestataire
}

export interface Prestataire {
  nom?: string
}