import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

export const AUTONOMIES = [
  'EntierementAccompagne',
  'PartiellementAutonome',
  'Autonome',
] as const

export const Autonomie = defineModel(z.enum(AUTONOMIES).brand('Autonomie'))

export type Autonomie = Model.TypeOf<typeof Autonomie>

export const autonomies: readonly Autonomie[] = AUTONOMIES.map(Autonomie)
