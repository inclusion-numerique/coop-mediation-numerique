import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

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
