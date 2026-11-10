import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

const VALEURS = [
  'EntierementAccompagne',
  'PartiellementAutonome',
  'Autonome',
] as const

export const Autonomie = defineModel(z.enum(VALEURS).brand('Autonomie'))

export type Autonomie = Model.TypeOf<typeof Autonomie>

export const autonomies: readonly Autonomie[] = VALEURS.map(Autonomie)
