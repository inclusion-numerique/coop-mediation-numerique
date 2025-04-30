import z from 'zod'
import { CraCollectifValidation } from './CraCollectifValidation'
import {
  canHaveAdministationThematiques,
  cannotHaveAdministrationThematiquesMessage,
} from './validation/canHaveAdministrationThematiques'
import {
  canHavePrecisionDemarche,
  cannotHavePrecisionDemarcheMessage,
} from './validation/canHavePrecisionDemarche'

export const CraCollectifServerValidation = CraCollectifValidation.refine(
  canHavePrecisionDemarche,
  { message: cannotHavePrecisionDemarcheMessage, path: ['precisionsDemarche'] },
).refine(canHaveAdministationThematiques, {
  message: cannotHaveAdministrationThematiquesMessage,
  path: ['thematiques'],
})

export type CraIndividuelData = z.infer<typeof CraCollectifServerValidation>
