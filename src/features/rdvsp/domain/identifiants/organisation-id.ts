import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'

export const OrganisationId = defineModel(
  z.number().int().positive().brand('OrganisationId'),
)

export type OrganisationId = Model.TypeOf<typeof OrganisationId>
