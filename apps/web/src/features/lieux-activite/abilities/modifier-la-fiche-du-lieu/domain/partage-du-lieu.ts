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

export type PartageDuLieu = {
  readonly autresMediateurs: NombreDeMediateurs
  readonly activites: NombreDActivites
}

export const estPartage = ({ autresMediateurs }: PartageDuLieu): boolean =>
  autresMediateurs > 0
