import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

export const NomDuTag = defineModel(z.string().trim().min(1).brand('NomDuTag'))

export type NomDuTag = Model.TypeOf<typeof NomDuTag>

export const NomDuTagCanonique = defineModel(
  z.string().trim().toLowerCase().min(1).brand('NomDuTagCanonique'),
)

export type NomDuTagCanonique = Model.TypeOf<typeof NomDuTagCanonique>

export const memeNom = (un: NomDuTag, autre: NomDuTag): boolean =>
  NomDuTagCanonique(un) === NomDuTagCanonique(autre)
