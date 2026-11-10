import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

const VALEURS = [
  'Administration',
  'MediationNumerique',
  'OperateurOuOrganismeEnCharge',
  'AideSociale',
  'InsertionProfessionnelle',
  'AideAuxDemarchesAdministratives',
  'Autre',
] as const

export const StructureDeRedirection = defineModel(
  z.enum(VALEURS).brand('StructureDeRedirection'),
)

export type StructureDeRedirection = Model.TypeOf<typeof StructureDeRedirection>

export const structuresDeRedirection: readonly StructureDeRedirection[] =
  VALEURS.map(StructureDeRedirection)
