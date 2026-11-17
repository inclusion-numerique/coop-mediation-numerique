import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'

/**
 * Identifiant d'un usager côté RDV Service Public — à ne pas confondre avec
 * l'identifiant du bénéficiaire La Coop auquel il est rattaché, qui est un uuid.
 */
export const UsagerId = defineModel(
  z.number().int().positive().brand('UsagerId'),
)

export type UsagerId = Model.TypeOf<typeof UsagerId>
