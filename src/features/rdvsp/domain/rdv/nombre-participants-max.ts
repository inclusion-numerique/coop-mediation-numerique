import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'

export const NombreParticipantsMax = defineModel(
  z.number().int().positive().brand('NombreParticipantsMax'),
)

export type NombreParticipantsMax = Model.TypeOf<typeof NombreParticipantsMax>
