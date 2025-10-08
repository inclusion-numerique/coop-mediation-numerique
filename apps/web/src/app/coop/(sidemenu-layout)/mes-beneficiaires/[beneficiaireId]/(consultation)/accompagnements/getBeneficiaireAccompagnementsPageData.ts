import { searchActiviteAndRdvs } from '@app/web/features/activites/use-cases/list/db/searchActiviteAndRdvs'
import { prismaClient } from '@app/web/prismaClient'
import type { UserId, UserRdvAccount, UserTimezone } from '@app/web/utils/user'

export const getBeneficiaireAccompagnementsPageData = async ({
  beneficiaireId,
  mediateurId,
  user,
}: {
  beneficiaireId: string
  // The mediateur making the request (for security check)
  mediateurId: string
  user: UserRdvAccount & UserId & UserTimezone
}) => {
  const beneficiaire = await prismaClient.beneficiaire.findUnique({
    where: {
      id: beneficiaireId,
      // Only query the beneficiaire if it belongs to the mediateur
      mediateurId,
      suppression: null,
    },
    select: {
      id: true,
      mediateurId: true,
      rdvServicePublicId: true,
      prenom: true,
      nom: true,
      anneeNaissance: true,
      accompagnementsCount: true,
    },
  })
  if (!beneficiaire) {
    return null
  }

  const searchResult = await searchActiviteAndRdvs({
    mediateurIds: [mediateurId],
    beneficiaireIds: [beneficiaireId],
    rdvAccountIds: user.rdvAccount ? [user.rdvAccount.id] : [],
    shouldFetchRdvs: !!user.rdvAccount?.hasOauthTokens,
    shouldFetchActivites: true,
    searchParams: {
      lignes: '10000',
    },
  })

  return {
    beneficiaire,
    searchResult,
    user,
  }
}

export type BeneficiaireAccompagnementsPageData = Exclude<
  Awaited<ReturnType<typeof getBeneficiaireAccompagnementsPageData>>,
  null
>
