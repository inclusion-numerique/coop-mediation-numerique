import z from 'zod'
import {
  canHaveAdministationThematiques,
  cannotHaveAdministrationThematiquesMessage,
} from '../../validation/canHaveAdministrationThematiques'
import {
  canHavePrecisionDemarche,
  cannotHavePrecisionDemarcheMessage,
} from '../../validation/canHavePrecisionDemarche'
import { CraIndividuelValidation } from './CraIndividuelValidation'

export const CraIndividuelServerValidation = CraIndividuelValidation.refine(
  canHavePrecisionDemarche,
  { message: cannotHavePrecisionDemarcheMessage, path: ['precisionsDemarche'] },
).refine(canHaveAdministationThematiques, {
  message: cannotHaveAdministrationThematiquesMessage,
  path: ['thematiques'],
})

export type CraIndividuelServerData = z.infer<
  typeof CraIndividuelServerValidation
>
