import { MediateurId } from '@/features/beneficiaire/domain/mediateur-id'
import type { BeneficiaireTrouve } from '../../domain/beneficiaires-recherches'
import { beneficiairesProposes } from './rechercher-beneficiaires.query'

export const beneficiairesLesPlusSuivis = async (
  mediateurId: string,
): Promise<readonly BeneficiaireTrouve[]> =>
  (
    await beneficiairesProposes({
      mediateurId: MediateurId(mediateurId),
    })
  ).beneficiaires
