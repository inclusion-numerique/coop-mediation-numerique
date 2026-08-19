import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

/** Identifiant d'une participation (usager × rendez-vous) côté RDV Service Public. */
export const ParticipationId = defineModel(
  z.number().int().positive().brand('ParticipationId'),
)

export type ParticipationId = Model.TypeOf<typeof ParticipationId>
