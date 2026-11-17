import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

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

export const structuresDeRedirection: readonly StructureDeRedirection[] =
  STRUCTURES_DE_REDIRECTION.map(StructureDeRedirection)
