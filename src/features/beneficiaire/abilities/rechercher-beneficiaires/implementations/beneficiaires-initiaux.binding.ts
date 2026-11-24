import { BeneficiaireId } from '@/features/beneficiaire/domain/beneficiaire-id'
import { MediateurId } from '@/features/beneficiaire/domain/mediateur-id'
import type { BeneficiairesRecherches } from '../domain/rechercher-beneficiaires'
import { beneficiairesProposes } from './prisma/rechercher-beneficiaires.query'

const AUCUN: BeneficiairesRecherches = { beneficiaires: [], totalCount: 0 }

export const beneficiairesInitiauxAvec =
  <Options>(presenter: (recherches: BeneficiairesRecherches) => Options) =>
  async ({
    mediateurId,
    includeBeneficiaireIds,
  }: {
    mediateurId?: string | undefined
    includeBeneficiaireIds?: string[]
  }): Promise<Options> =>
    presenter(
      mediateurId == null
        ? AUCUN
        : await beneficiairesProposes({
            mediateurId: MediateurId(mediateurId),
            ...(includeBeneficiaireIds === undefined
              ? {}
              : {
                  includeBeneficiaireIds:
                    includeBeneficiaireIds.map(BeneficiaireId),
                }),
          }),
    )
