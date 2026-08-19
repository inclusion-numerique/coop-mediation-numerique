import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

/** Identifiant d'une organisation côté RDV Service Public. */
export const OrganisationId = defineModel(
  z.number().int().positive().brand('OrganisationId'),
)

export type OrganisationId = Model.TypeOf<typeof OrganisationId>
