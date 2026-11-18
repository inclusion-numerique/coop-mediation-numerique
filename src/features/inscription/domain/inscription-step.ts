import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'

export const inscriptionSteps = [
  'initialize',
  'choisir-role',
  'verifier-informations',
  'renseigner-structure-employeuse',
  'lieux-activite',
  'recapitulatif',
] as const

export const InscriptionStep = defineModel(
  z.enum(inscriptionSteps).brand('InscriptionStep'),
)

export type InscriptionStep = Model.TypeOf<typeof InscriptionStep>

/** Union des valeurs brutes (non brandées) — clés de mapping (URLs, etc.). */
export type InscriptionStepValue = (typeof inscriptionSteps)[number]
