import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'

const echeancesDuContrat = ['EnCours', 'FinProchaine', 'Termine'] as const

export const EcheanceDuContrat = defineModel(z.enum(echeancesDuContrat))

export type EcheanceDuContrat = Model.TypeOf<typeof EcheanceDuContrat>
