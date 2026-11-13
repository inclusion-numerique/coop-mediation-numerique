import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

export const NomDeFamille = defineModel(
  z.string().trim().min(1).brand('NomDeFamille'),
)

export type NomDeFamille = Model.TypeOf<typeof NomDeFamille>
