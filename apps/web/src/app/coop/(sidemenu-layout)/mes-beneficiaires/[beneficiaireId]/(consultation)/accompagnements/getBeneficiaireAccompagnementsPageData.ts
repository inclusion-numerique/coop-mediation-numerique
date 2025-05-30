import { beneficiaireAccompagnementsCountSelect } from '@app/web/beneficiaire/beneficiaireQueries'
import {
  getAllActivites,
  groupActivitesByDate,
} from '@app/web/features/activites/use-cases/list/db/activitesQueries'
import { prismaClient } from '@app/web/prismaClient'

export const getBeneficiaireAccompagnementsPageData = async ({
  beneficiaireId,
  mediateurId,
}: {
  beneficiaireId: string
  // The mediateur making the request (for security check)
  mediateurId: string
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

  const activitesByDate = groupActivitesByDate(activites)

  return {
    beneficiaire,
    activitesByDate,
  }
}

export type BeneficiaireAccompagnementsPageData = Exclude<
  Awaited<ReturnType<typeof getBeneficiaireAccompagnementsPageData>>,
  null
>
