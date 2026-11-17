import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'

export const MATERIELS = [
  'Ordinateur',
  'Telephone',
  'Tablette',
  'Autre',
] as const

export const Materiel = defineModel(z.enum(MATERIELS).brand('Materiel'))

export type Materiel = Model.TypeOf<typeof Materiel>

export const materiels: readonly Materiel[] = MATERIELS.map(Materiel)
