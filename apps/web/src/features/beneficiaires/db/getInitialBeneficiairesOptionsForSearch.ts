import { getBeneficiaireDisplayName } from '@app/web/beneficiaire/getBeneficiaireDisplayName'
import { getInitialBeneficiairesOptions } from '@app/web/features/beneficiaire/abilities/rechercher-beneficiaires/implementation'
import { toBeneficiaireData } from '@app/web/features/beneficiaire/abilities/rechercher-beneficiaires/ui/beneficiaire-option'
import { BeneficiaireId } from '@app/web/features/beneficiaire/domain/beneficiaire-id'
import { MediateurId } from '@app/web/features/beneficiaire/domain/mediateur-id'
import { BeneficiaireOption } from '../BeneficiaireOption'

const nonAffichesOption = (count: number): BeneficiaireOption => ({
  label: `Veuillez préciser votre recherche - ${count} bénéficiaire${
    count === 1 ? ' n’est pas affiché' : 's ne sont pas affichés'
  }`,
  value: null,
})

export const getInitialBeneficiairesOptionsForSearch = async ({
  mediateurId,
  includeBeneficiaireIds,
}: {
  mediateurId?: string
  includeBeneficiaireIds?: string[]
}): Promise<BeneficiaireOption[]> => {
  if (mediateurId == null) return []

  const { beneficiaires, totalCount } = await getInitialBeneficiairesOptions({
    mediateurId: MediateurId(mediateurId),
    includeBeneficiaireIds: includeBeneficiaireIds?.map(BeneficiaireId),
  })

  const options: BeneficiaireOption[] = beneficiaires.map((beneficiaire) => ({
    label: getBeneficiaireDisplayName(beneficiaire),
    value: toBeneficiaireData(beneficiaire),
  }))

  const nonAffiches = totalCount - options.length

  return nonAffiches > 0
    ? [...options, nonAffichesOption(nonAffiches)]
    : options
}

export type MostUsedBeneficiairesForSearch = Awaited<
  ReturnType<typeof getInitialBeneficiairesOptionsForSearch>
>
