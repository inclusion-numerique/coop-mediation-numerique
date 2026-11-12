import { MediateurId } from '@app/web/features/beneficiaire/domain/mediateur-id'
import type { BeneficiaireSearchItem } from '../../domain/rechercher-beneficiaires'
import { getInitialBeneficiairesOptions } from './rechercher-beneficiaires.query'

export const beneficiairesLesPlusSuivis = async (
  mediateurId: string,
): Promise<readonly BeneficiaireSearchItem[]> =>
  (
    await getInitialBeneficiairesOptions({
      mediateurId: MediateurId(mediateurId),
    })
  ).beneficiaires
