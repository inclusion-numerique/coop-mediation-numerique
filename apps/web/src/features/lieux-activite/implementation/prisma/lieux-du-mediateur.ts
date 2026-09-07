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

/**
 * La visibilité déclarée des lieux où un médiateur exerce, avec leur commune.
 *
 * Sert la page « mes outils » : combien de mes lieux sont annoncés sur la
 * cartographie nationale, et vers quel département pointer le lien vers la
 * carte.
 *
 * Attention au sens de « visible » : c'est la déclaration portée par le lieu,
 * pas le résultat du moissonnage. `lieuxPublies` y ajoute une condition — au
 * moins un médiateur VISIBLE doit y exercer — si bien qu'un médiateur qui a
 * masqué son profil peut voir ses lieux comptés ici sans qu'ils paraissent sur
 * la carte. L'écart est connu ; le corriger changerait ce que la page annonce.
 */
export const visibiliteDesLieuxDuMediateur = async ({
  mediateurId,
}: {
  mediateurId: string
}): Promise<
  readonly {
    readonly codeInsee: string | null
    readonly visiblePourCartographieNationale: boolean
  }[]
> => {
  const enActivite = await prismaClient.mediateurEnActivite.findMany({
    where: { mediateurId, suppression: null, fin: null },
    select: {
      lieuInclusion: {
        select: { codeInsee: true, visiblePourCartographieNationale: true },
      },
    },
  })

  return enActivite.map(({ lieuInclusion }) => lieuInclusion)
}
