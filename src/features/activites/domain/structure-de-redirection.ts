import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'

export const STRUCTURES_DE_REDIRECTION = [
  'Administration',
  'MediationNumerique',
  'OperateurOuOrganismeEnCharge',
  'AideSociale',
  'InsertionProfessionnelle',
  'AideAuxDemarchesAdministratives',
  'Autre',
] as const

export const StructureDeRedirection = defineModel(
  z.enum(STRUCTURES_DE_REDIRECTION).brand('StructureDeRedirection'),
)

export type StructureDeRedirection = Model.TypeOf<typeof StructureDeRedirection>
