import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

export const NombreDeMediateurs = defineModel(
  z.number().int().nonnegative().brand('NombreDeMediateurs'),
)

export type NombreDeMediateurs = Model.TypeOf<typeof NombreDeMediateurs>

export const NombreDActivites = defineModel(
  z.number().int().nonnegative().brand('NombreDActivites'),
)

export type NombreDActivites = Model.TypeOf<typeof NombreDActivites>

export const NombreDeLieux = defineModel(
  z.number().int().nonnegative().brand('NombreDeLieux'),
)

export type NombreDeLieux = Model.TypeOf<typeof NombreDeLieux>
