import z from 'zod'
import {
  canHaveAdministationThematiques,
  cannotHaveAdministrationThematiquesMessage,
} from '../../validation/canHaveAdministrationThematiques'
import {
  canHavePrecisionDemarche,
  cannotHavePrecisionDemarcheMessage,
} from '../../validation/canHavePrecisionDemarche'
import { CraCollectifValidation } from './CraCollectifValidation'

export const CraCollectifServerValidation = CraCollectifValidation.refine(
  canHavePrecisionDemarche,
  { message: cannotHavePrecisionDemarcheMessage, path: ['precisionsDemarche'] },
).refine(canHaveAdministationThematiques, {
  message: cannotHaveAdministrationThematiquesMessage,
  path: ['thematiques'],
})

export type CraCollectifServerData = z.infer<
  typeof CraCollectifServerValidation
>
