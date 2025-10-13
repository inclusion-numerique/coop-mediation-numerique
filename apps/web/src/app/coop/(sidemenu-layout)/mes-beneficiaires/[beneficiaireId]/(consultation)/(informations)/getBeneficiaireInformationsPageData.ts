import { countThematiques } from '@app/web/beneficiaire/beneficiaireQueries'
import { getBeneficiaireDisplayName } from '@app/web/beneficiaire/getBeneficiaireDisplayName'
import { searchActiviteAndRdvs } from '@app/web/features/activites/use-cases/list/db/searchActiviteAndRdvs'
import { prismaClient } from '@app/web/prismaClient'
import type { UserId, UserRdvAccount, UserTimezone } from '@app/web/utils/user'

export const getBeneficiaireInformationsPageData = async ({
  beneficiaireId,
  mediateurId,
  user,
}: {
  beneficiaireId: string
  // The mediateur making the request (for security check)
  mediateurId: string
  user: UserId & UserTimezone & UserRdvAccount
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
      rdvUserId: true,
      rdvServicePublicId: true,
      mediateurId: true,
      prenom: true,
      nom: true,
      email: true,
      anneeNaissance: true,
      notes: true,
      genre: true,
      trancheAge: true,
      creation: true,
      adresse: true,
      telephone: true,
      pasDeTelephone: true,
      statutSocial: true,
      commune: true,
      communeCodePostal: true,
      communeCodeInsee: true,
      accompagnementsCount: true,
    },
  })
  if (!beneficiaire) {
    return null
  }

  const displayName = getBeneficiaireDisplayName(beneficiaire)

  const thematiquesCounts = await countThematiques({
    beneficiaireId,
    mediateurId,
  })

  // We reuse search logic but we only are interested by counts
  const searchResult = await searchActiviteAndRdvs({
    mediateurIds: [mediateurId],
    beneficiaireIds: [beneficiaireId],
    rdvUserIds: beneficiaire.rdvUserId ? [beneficiaire.rdvUserId] : [],
    rdvAccountIds: user.rdvAccount ? [user.rdvAccount.id] : [],
    shouldFetchRdvs: !!user.rdvAccount?.hasOauthTokens,
    shouldFetchActivites: true,
    searchParams: {
      lignes: '1',
    },
  })

  const totalActivitesCount = searchResult.matchesCount

  return {
    displayName,
    beneficiaire,
    thematiquesCounts,
    totalActivitesCount,
  }
}

export type BeneficiaireInformationsPageData = Exclude<
  Awaited<ReturnType<typeof getBeneficiaireInformationsPageData>>,
  null
>
