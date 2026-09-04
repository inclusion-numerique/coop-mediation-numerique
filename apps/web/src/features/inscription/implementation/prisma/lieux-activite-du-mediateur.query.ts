import { StructureData } from '@app/web/components/structure/StructureValidation'
import { prismaClient } from '@app/web/prismaClient'

/**
 * Lieux d'activité auxquels un médiateur est rattaché à l'instant présent :
 * rattachements ni supprimés ni clos, du plus ancien au plus récent.
 *
 * Partagée par deux abilities, d'où sa place au niveau feature :
 * `renseigner-lieux-activite` en pré-remplit son étape, `valider` les affiche au
 * récapitulatif.
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

  const lieuxActivite: StructureData[] = enActivite.map(
    (lieuActivite) => lieuActivite.lieuInclusion,
  )

  return lieuxActivite
}
