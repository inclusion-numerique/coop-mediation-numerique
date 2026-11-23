import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'

export const AUTONOMIES = [
  'EntierementAccompagne',
  'PartiellementAutonome',
  'Autonome',
] as const

export const Autonomie = defineModel(z.enum(AUTONOMIES).brand('Autonomie'))

export type Autonomie = Model.TypeOf<typeof Autonomie>
