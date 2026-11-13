import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

export const TitreDuRendezVous = defineModel(
  z.string().trim().min(1).brand('TitreDuRendezVous'),
)

export type TitreDuRendezVous = Model.TypeOf<typeof TitreDuRendezVous>
