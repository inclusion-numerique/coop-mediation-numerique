import { fromSchemaDataInclusion } from '@gouvfr-anct/lieux-de-mediation-numerique'
import { prismaClient } from '@app/web/prismaClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const GET = async () => {
  const structures = await prismaClient.structure.findMany({
    // TODO Select orga / lieux activité to know if it is open to public
    where: {
      suppression: null,
      OR: [
        {
          modification: {
            gt: 'dateMaj',
          },
        },
        {
          idDataInclusion: null,
        },
      ],
    },
  })

  const lieux = structures.map((structure) => {
    const id = structure.idDataInclusion ?? structure.id

    const source = 'coop-numerique'

    // TODO Si conseiller numérique en activité (a ajouter au select)
    const hasConseillerNumeriqueEnActivite = false

    return fromSchemaDataInclusion(
      [
        {
          id,
          nom: 'Médiation numérique',
          structure_id: id,
          source,
        },
      ],
      {
        id,
        source,
        code_postal: structure.codePostal,
        date_maj: structure.dateMaj.toISOString(),
        nom: structure.nom,
        rna: structure.rna ?? undefined,
        siret: structure.siret ?? undefined,
        adresse: structure.adresse,
        commune: structure.commune,
        code_insee: structure.codeInsee ?? undefined,
        thematiques: [
          'numerique--utiliser-le-numerique-au-quotidien',
          'numerique--approfondir-ma-culture-numerique',
        ],
        labels_nationaux: hasConseillerNumeriqueEnActivite
          ? ['conseiller-numerique']
          : [],
      },
    )
  })

  return new Response(JSON.stringify(lieux))
}