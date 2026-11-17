import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'

export const TitreDuRendezVous = defineModel(
  z.string().trim().min(1).brand('TitreDuRendezVous'),
)

export type TitreDuRendezVous = Model.TypeOf<typeof TitreDuRendezVous>
