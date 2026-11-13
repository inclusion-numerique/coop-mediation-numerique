import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

export const MATERIELS = [
  'Ordinateur',
  'Telephone',
  'Tablette',
  'Autre',
] as const

export const Materiel = defineModel(z.enum(MATERIELS).brand('Materiel'))

export type Materiel = Model.TypeOf<typeof Materiel>

export const materiels: readonly Materiel[] = MATERIELS.map(Materiel)
