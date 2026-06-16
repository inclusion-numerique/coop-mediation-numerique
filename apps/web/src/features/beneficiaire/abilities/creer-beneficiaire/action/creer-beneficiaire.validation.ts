import {
  beneficiaireWireShape,
  toBeneficiaireACreer,
} from '@app/web/features/beneficiaire/domain/beneficiaire-wire'

export const CreerBeneficiaireValidation =
  beneficiaireWireShape.transform(toBeneficiaireACreer)
