import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'

export const FiltreStatut = defineModel(
  z
    .enum(['actifs', 'inactifs', 'invitations', 'archives'])
    .brand('FiltreStatut'),
)
export type FiltreStatut = Model.TypeOf<typeof FiltreStatut>

export const FiltreRole = defineModel(
  z.enum(['conseiller-numerique', 'mediateur-numerique']).brand('FiltreRole'),
)
export type FiltreRole = Model.TypeOf<typeof FiltreRole>

export const TriEquipe = defineModel(
  z.enum(['membre', 'structureEmployeuse', 'statut']).brand('TriEquipe'),
)
export type TriEquipe = Model.TypeOf<typeof TriEquipe>

export const OrdreDeTri = defineModel(
  z.enum(['asc', 'desc']).brand('OrdreDeTri'),
)
export type OrdreDeTri = Model.TypeOf<typeof OrdreDeTri>

export const Recherche = defineModel(
  z.string().trim().min(1).max(100).brand('Recherche'),
)
export type Recherche = Model.TypeOf<typeof Recherche>

export type CriteresEquipe = {
  readonly recherche: Recherche | null
  readonly statuts: readonly FiltreStatut[]
  readonly role: FiltreRole | null
  readonly tri: TriEquipe
  readonly ordre: OrdreDeTri
}
