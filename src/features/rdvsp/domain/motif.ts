import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'
import type { NomMotif } from './libelle'
import type { MotifId } from './motif-id'
import type { OrganisationId } from './organisation-id'

export const CategorieMotifId = defineModel(
  z.number().int().positive().brand('CategorieMotifId'),
)
export type CategorieMotifId = Model.TypeOf<typeof CategorieMotifId>

/**
 * Motif sur lequel le rendez-vous a été pris.
 *
 * Le modèle porte ce que La Coop persiste, et rien de plus : `collectif`
 * détermine la forme du compte rendu, `suivi` indique un motif de suivi dans le
 * temps, `instruction` est le texte affiché à l'usager. Les règles de
 * réservation de RDV Service Public restent chez eux.
 */
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
