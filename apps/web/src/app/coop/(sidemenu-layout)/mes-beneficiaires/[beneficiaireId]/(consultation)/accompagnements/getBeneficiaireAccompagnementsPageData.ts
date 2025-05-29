import { getRdvs } from '@app/web/app/coop/(sidemenu-layout)/mes-beneficiaires/[beneficiaireId]/(consultation)/accompagnements/getRdvs'
import type { SessionUser } from '@app/web/auth/sessionUser'
import { beneficiaireAccompagnementsCountSelect } from '@app/web/beneficiaire/beneficiaireQueries'
import { getAllActivites } from '@app/web/features/activites/use-cases/list/db/activitesQueries'
import { mergeRdvsWithActivites } from '@app/web/features/activites/use-cases/list/mergeRdvsWithActivites'
import { prismaClient } from '@app/web/prismaClient'
import { isDefinedAndNotNull } from '@app/web/utils/isDefinedAndNotNull'
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
      ...beneficiaireAccompagnementsCountSelect,
    },
  })
  if (!beneficiaire) {
    return null
  }

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
    activites,
  })

  const activitesAndRdvs = [...rdvsWithoutActivite, ...activitesWithRdv].sort(
    (a, b) => {
      return b.date.getTime() - a.date.getTime()
    },
  )

  return {
    beneficiaire,
    activites: activitesWithRdv,
    rdvs: rdvsWithoutActivite,
    activitesAndRdvs,
    user,
  }
}

export type BeneficiaireAccompagnementsPageData = Exclude<
  Awaited<ReturnType<typeof getBeneficiaireAccompagnementsPageData>>,
  null
>
