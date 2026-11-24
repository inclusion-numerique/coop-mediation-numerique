import type { Search, Sort } from '@arckit/resultset'
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

export type ColonneDeLEquipe = 'membre' | 'structureEmployeuse' | 'statut'

export type CriteresEquipe = {
  readonly recherche: Search
  readonly statuts: readonly FiltreStatut[]
  readonly role: FiltreRole | null
  readonly tri: Sort<ColonneDeLEquipe>
}
