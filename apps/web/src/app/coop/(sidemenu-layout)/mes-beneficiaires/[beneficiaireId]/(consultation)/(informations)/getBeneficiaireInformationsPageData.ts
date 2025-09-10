import { countThematiques } from '@app/web/beneficiaire/beneficiaireQueries'
import { getBeneficiaireDisplayName } from '@app/web/beneficiaire/getBeneficiaireDisplayName'
import {
  ActiviteListItem,
  getAllActivites,
} from '@app/web/features/activites/use-cases/list/db/activitesQueries'
import { mergeRdvsWithActivites } from '@app/web/features/activites/use-cases/list/mergeRdvsWithActivites'
import { prismaClient } from '@app/web/prismaClient'
import { getRdvs } from '@app/web/rdv-service-public/getRdvs'
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

  const activites = await getAllActivites({ beneficiaireId, mediateurId })

  const rdvs = await getRdvs({
    user,
    onlyForUser: false, // We want rdvs for this beneficiaire from all agents
    beneficiaire,
    du: null,
    au: null,
  })

  const { rdvsWithoutActivite, activitesWithRdv } = mergeRdvsWithActivites({
    rdvs,
    activites: activites.map(
      (activite) =>
        ({
          ...activite,
          timezone: user.timezone,
        }) satisfies ActiviteListItem,
    ),
  })

  return {
    displayName,
    beneficiaire,
    thematiquesCounts,
    totalActivitesCount: rdvsWithoutActivite.length + activitesWithRdv.length,
  }
}

export type BeneficiaireInformationsPageData = Exclude<
  Awaited<ReturnType<typeof getBeneficiaireInformationsPageData>>,
  null
>
