import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'

const inscriptionSteps = [
  'initialize',
  'choisir-role',
  'verifier-informations',
  'renseigner-structure-employeuse',
  'lieux-activite',
  'recapitulatif',
] as const

export const EtapeDInscription = defineModel(
  z.enum(inscriptionSteps).brand('InscriptionStep'),
)

export type EtapeDInscription = Model.TypeOf<typeof EtapeDInscription>

/** Union des valeurs brutes (non brandées) — clés de mapping (URLs, etc.). */
export type ValeurDEtapeDInscription = (typeof inscriptionSteps)[number]
