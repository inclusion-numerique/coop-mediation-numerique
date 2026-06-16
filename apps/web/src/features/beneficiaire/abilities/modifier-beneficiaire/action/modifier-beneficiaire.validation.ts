import { BeneficiaireId } from '@app/web/features/beneficiaire/domain/beneficiaire-id'
import {
  beneficiaireWireShape,
  toBeneficiaireACreer,
} from '@app/web/features/beneficiaire/domain/beneficiaire-wire'
import type { BeneficiaireAModifier } from '../domain/beneficiaire-a-modifier'

export const ModifierBeneficiaireValidation = beneficiaireWireShape
  .extend({ id: BeneficiaireId.schema })
  .transform(
    ({ id, ...wire }): BeneficiaireAModifier => ({
      ...toBeneficiaireACreer(wire),
      id,
    }),
  )
