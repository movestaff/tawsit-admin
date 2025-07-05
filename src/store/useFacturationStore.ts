import { create } from 'zustand'
import type { UseBoundStore, StoreApi } from 'zustand'
import { devtools } from 'zustand/middleware'
import {
  fetchPeriodes as apiFetchPeriodes,
  cloturerPeriode as apiCloturerPeriode,
  fetchMontants as apiFetchMontants,
  calculerMontants as apiCalculerMontants,
  validerMontants as apiValiderMontants,
  fetchPaiements as apiFetchPaiements,
  creerPaiement as apiCreerPaiement,
  validerPaiement as apiValiderPaiement,
  marquerPaiementEffectue as apiMarquerPaiementEffectue,
  annulerPaiement as apiAnnulerPaiement
} from '../lib/api'

import type { Periode, Montant, Paiement } from '../types/facturation'

export interface FacturationState {
  periodes: Periode[]
  periodesLoading: boolean
  montants: Montant[]
  montantsLoading: boolean
  paiements: Paiement[]
  paiementsLoading: boolean
  error: any

  fetchPeriodes: () => Promise<void>
  cloturerPeriode: (periodeId: string) => Promise<void>
  lancerCalculMontants: (periodeId: string) => Promise<void>

  fetchMontants: (periodeId: string) => Promise<void>
  validerMontants: (ids: string[], periodeId: string) => Promise<void>

  fetchPaiements: () => Promise<void>
  creerPaiement: (periodeId: string) => Promise<void>
  validerPaiement: (paiementId: string) => Promise<void>
  marquerPaiementEffectue: (paiementId: string, periodeId: string) => Promise<void>
  annulerPaiement: (paiementId: string) => Promise<void>
}

const useFacturationStore = create<FacturationState>()(devtools<FacturationState>((set, get) => ({

  // STATE
  periodes: [],
  periodesLoading: false,
  montants: [],
  montantsLoading: false,
  paiements: [],
  paiementsLoading: false,
  error: null,

  // ACTIONS
  fetchPeriodes: async () => {
    set({ periodesLoading: true, error: null })
    const periodes = await apiFetchPeriodes()
    set({ periodes, periodesLoading: false })
  },

  cloturerPeriode: async (periodeId) => {
    await apiCloturerPeriode(periodeId)
    get().fetchPeriodes()
  },

  lancerCalculMontants: async (periodeId) => {
    await apiCalculerMontants(periodeId)
    await get().fetchMontants(periodeId)
    await get().fetchPeriodes()
  },

  fetchMontants: async (periodeId) => {
    set({ montantsLoading: true, error: null })
    const montants = await apiFetchMontants(periodeId)
    set({ montants, montantsLoading: false })
  },

  validerMontants: async (ids, periodeId) => {
    await apiValiderMontants(ids)
    await get().fetchMontants(periodeId)
    await get().fetchPeriodes()
  },

  fetchPaiements: async () => {
    set({ paiementsLoading: true, error: null })
    const paiements = await apiFetchPaiements()
    set({ paiements, paiementsLoading: false })
  },

  creerPaiement: async (periodeId) => {
    await apiCreerPaiement(periodeId)
    await get().fetchPaiements()
    await get().fetchMontants(periodeId)
  },

  validerPaiement: async (paiementId) => {
    await apiValiderPaiement(paiementId)
    await get().fetchPaiements()
  },

  marquerPaiementEffectue: async (paiementId, periodeId) => {
    await apiMarquerPaiementEffectue(paiementId, periodeId)
    await get().fetchPaiements()
    await get().fetchMontants(periodeId)
  await get().fetchPeriodes()
},

annulerPaiement: async (paiementId: string) => {
  try {
    await apiAnnulerPaiement(paiementId)
    await get().fetchPaiements()
    await get().fetchPeriodes()  // Rafraîchir pour voir la période re-ouverte
  } catch (err) {
    console.error('Erreur annulerPaiement:', err)
  }
}


}))


)as unknown as UseBoundStore<StoreApi<FacturationState>>

export default useFacturationStore
