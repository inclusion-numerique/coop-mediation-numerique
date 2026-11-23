import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'

/** Identifiant d'une participation (usager × rendez-vous) côté RDV Service Public. */
export const ParticipationId = defineModel(
  z.number().int().positive().brand('ParticipationId'),
)

export type ParticipationId = Model.TypeOf<typeof ParticipationId>
