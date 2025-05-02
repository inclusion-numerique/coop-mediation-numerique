import { getBeneficiaireRdvsList } from '@app/web/app/coop/(sidemenu-layout)/mes-beneficiaires/[beneficiaireId]/(consultation)/accompagnements/getBeneficiaireRdvsList'
import type { SessionUser } from '@app/web/auth/sessionUser'
import { beneficiaireAccompagnementsCountSelect } from '@app/web/beneficiaire/beneficiaireQueries'
import {
  getAllActivites,
  groupActivitesByDate,
} from '@app/web/features/activites/use-cases/list/db/activitesQueries'
import { prismaClient } from '@app/web/prismaClient'

export const getBeneficiaireAccompagnementsPageData = async ({
  beneficiaireId,
  mediateurId,
  user,
}: {
  beneficiaireId: string
  // The mediateur making the request (for security check)
  mediateurId: string
  user: Pick<SessionUser, 'id' | 'rdvAccount'>
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

  const rdvs = await getBeneficiaireRdvsList({
    user,
    beneficiaire,
  })

  const activitesByDate = groupActivitesByDate({ activites, rdvs })

  return {
    beneficiaire,
    activitesByDate,
    rdvs,
  }
}

export type BeneficiaireAccompagnementsPageData = Exclude<
  Awaited<ReturnType<typeof getBeneficiaireAccompagnementsPageData>>,
  null
>
