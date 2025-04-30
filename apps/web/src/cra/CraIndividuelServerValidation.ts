import z from 'zod'
import { CraIndividuelValidation } from './CraIndividuelValidation'
import {
  canHaveAdministationThematiques,
  cannotHaveAdministrationThematiquesMessage,
} from './validation/canHaveAdministrationThematiques'
import {
  canHavePrecisionDemarche,
  cannotHavePrecisionDemarcheMessage,
} from './validation/canHavePrecisionDemarche'

export const CraIndividuelServerValidation = CraIndividuelValidation.refine(
  canHavePrecisionDemarche,
  { message: cannotHavePrecisionDemarcheMessage, path: ['precisionsDemarche'] },
).refine(canHaveAdministationThematiques, {
  message: cannotHaveAdministrationThematiquesMessage,
  path: ['thematiques'],
})

export type CraIndividuelData = z.infer<typeof CraIndividuelServerValidation>
