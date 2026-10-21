import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

export const NomTag = defineModel(z.string().trim().min(1).brand('NomTag'))

export type NomTag = Model.TypeOf<typeof NomTag>

export const NomTagCanonique = defineModel(
  z.string().trim().toLowerCase().min(1).brand('NomTagCanonique'),
)

export type NomTagCanonique = Model.TypeOf<typeof NomTagCanonique>

export const memeNom = (un: NomTag, autre: NomTag): boolean =>
  NomTagCanonique(un) === NomTagCanonique(autre)
