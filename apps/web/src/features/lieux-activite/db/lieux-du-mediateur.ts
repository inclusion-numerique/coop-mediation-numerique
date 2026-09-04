import { prismaClient } from '@app/web/prismaClient'

/**
 * Lieux d'activité auxquels un médiateur est rattaché à l'instant présent :
 * rattachements ni supprimés ni clos, du plus ancien au plus récent.
 *
 * C'est une question sur les lieux, posée par l'inscription : son étape « lieux
 * d'activité » s'en pré-remplit et son récapitulatif les affiche. Elle vit donc
 * ici, et l'inscription la lit par l'API publique de la feature.
 */
export const lieuxActiviteDuMediateur = async ({
  mediateurId,
}: {
  mediateurId: string
}) => {
  const enActivite = await prismaClient.mediateurEnActivite.findMany({
    where: {
      mediateurId,
      suppression: null,
      fin: null,
    },
    orderBy: {
      debut: 'asc',
    },
    select: {
      id: true,
      lieuInclusion: {
        select: {
          id: true,
          structureCartographieNationaleId: true,
          nom: true,
          commune: true,
          codePostal: true,
          codeInsee: true,
          siret: true,
          rna: true,
          adresse: true,
          complementAdresse: true,
          typologies: true,
        },
      },
    },
  })

  return enActivite.map((lieuActivite) => lieuActivite.lieuInclusion)
}

export type LieuDuMediateur = Awaited<
  ReturnType<typeof lieuxActiviteDuMediateur>
>[number]
