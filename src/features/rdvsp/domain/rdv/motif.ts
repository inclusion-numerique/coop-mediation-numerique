import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'
import type { MotifId } from '../identifiants/motif-id'
import type { OrganisationId } from '../identifiants/organisation-id'
import type { NomMotif } from '../libelle'

export const CategorieMotifId = defineModel(
  z.number().int().positive().brand('CategorieMotifId'),
)
export type CategorieMotifId = Model.TypeOf<typeof CategorieMotifId>

export type Motif = {
  readonly id: MotifId
  readonly nom: NomMotif
  readonly collectif: boolean
  readonly organisationId: OrganisationId
  readonly suivi: boolean
  readonly instruction: string | null
  readonly typeDeLieu: string | null
  readonly categorieId: CategorieMotifId | null
}
