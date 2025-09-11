import { getBeneficiaireDisplayName } from '@app/web/beneficiaire/getBeneficiaireDisplayName'
import { prismaBeneficiaireToBeneficiaireData } from '@app/web/beneficiaire/prismaBeneficiaireToBeneficiaireData'
import { searchBeneficiaireSelect } from '@app/web/beneficiaire/queryBeneficiairesForList'
import { beneficiairesListWhere } from '@app/web/beneficiaire/searchBeneficiaires'
import { prismaClient } from '@app/web/prismaClient'
import { BeneficiaireOption } from '../BeneficiaireOption'

export const getInitialBeneficiairesOptionsForSearch = async ({
  mediateurId,
  includeBeneficiaireIds,
}: {
  mediateurId?: string
  includeBeneficiaireIds?: string[]
}) => {
  if (mediateurId == null) return []

  // Initial list of beneficiaires for pre-populating selected beneficiary or quick select search
  const whereBeneficiaire = beneficiairesListWhere(mediateurId)
  const beneficiariesForSelect = await prismaClient.beneficiaire.findMany({
    // If we require an included beneficiaire, we exclude it from the search
    // as it will be added in subsequent query
    where: includeBeneficiaireIds
      ? { AND: [{ id: { notIn: includeBeneficiaireIds } }, whereBeneficiaire] }
      : whereBeneficiaire,
    select: searchBeneficiaireSelect,
    orderBy: [
      { accompagnementsCount: 'desc' },
      { nom: 'asc' },
      { prenom: 'asc' },
    ],
    take: 20,
  })

  if (includeBeneficiaireIds) {
    const includedBeneficiaires = await prismaClient.beneficiaire.findMany({
      where: {
        ...whereBeneficiaire,
        id: { in: includeBeneficiaireIds },
      },
      select: searchBeneficiaireSelect,
    })

    if (includedBeneficiaires) {
      beneficiariesForSelect.unshift(...includedBeneficiaires)
    }
  }

  const totalCountBeneficiaires = await prismaClient.beneficiaire.count({
    where: whereBeneficiaire,
  })

  const initialBeneficiairesOptions: BeneficiaireOption[] =
    beneficiariesForSelect.map((beneficiaire) => ({
      label: getBeneficiaireDisplayName({
        nom: beneficiaire.nom,
        prenom: beneficiaire.prenom,
      }),
      value: prismaBeneficiaireToBeneficiaireData(beneficiaire),
    }))

  const beneficiairesNotDisplayed =
    totalCountBeneficiaires - initialBeneficiairesOptions.length

  if (beneficiairesNotDisplayed > 0) {
    initialBeneficiairesOptions.push({
      label: `Veuillez préciser votre recherche - ${beneficiairesNotDisplayed} bénéficiaire${
        beneficiairesNotDisplayed === 1
          ? ' n’est pas affiché'
          : 's ne sont pas affichés'
      }`,
      value: null,
    })
  }

  return initialBeneficiairesOptions
}

export type MostUsedBeneficiairesForSearch = Awaited<
  ReturnType<typeof getInitialBeneficiairesOptionsForSearch>
>
