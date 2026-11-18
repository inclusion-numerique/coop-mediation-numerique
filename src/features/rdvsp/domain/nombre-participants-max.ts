import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'

/** Jauge d'un rendez-vous collectif. N'a de sens que pour un `RdvCollectif`. */
export const NombreParticipantsMax = defineModel(
  z.number().int().positive().brand('NombreParticipantsMax'),
)

export type NombreParticipantsMax = Model.TypeOf<typeof NombreParticipantsMax>
