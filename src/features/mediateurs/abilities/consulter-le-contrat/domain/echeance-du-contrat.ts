import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

export const echeancesDuContrat = [
  'EnCours',
  'FinProchaine',
  'Termine',
] as const

export const EcheanceDuContrat = defineModel(z.enum(echeancesDuContrat))

export type EcheanceDuContrat = Model.TypeOf<typeof EcheanceDuContrat>
