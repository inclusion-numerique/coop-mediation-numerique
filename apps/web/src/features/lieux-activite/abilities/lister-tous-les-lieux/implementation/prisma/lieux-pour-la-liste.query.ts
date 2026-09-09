import { prismaClient } from '@app/web/prismaClient'
import type { Prisma } from '@prisma/client'
import {
  champsDAffichage,
  inscriptionPourLaFiche,
} from '../../../../implementation/prisma/registre'
import type { LigneDeLaListe } from '../../ui/ligne-de-la-liste'

export const searchStructureSelect = {
  id: true,
  nom: true,
  adresse: true,
  commune: true,
  codePostal: true,
  codeInsee: true,
  siret: true,
  typologies: true,
  visiblePourCartographieNationale: true,
  inscriptionRegistre: inscriptionPourLaFiche,
  creation: true,
  modification: true,
  suppression: true,
  _count: {
    select: {
      mediateursEnActivite: {
        where: {
          suppression: null,
          fin: null,
          mediateur: { user: { deleted: null } },
        },
      },
      activites: {
        where: {
          suppression: null,
        },
      },
    },
  },
} satisfies Prisma.LieuInclusionSelect

/**
 * Les colonnes de la liste d'administration, et ce que chaque lieu porte
 * d'activité : médiateurs en exercice, activités, emplois.
 *
 * Le type de retour est celui que l'écran déclare : c'est lui qui dit ce qu'il
 * montre, et la requête qui s'y conforme. Sélectionner une colonne de moins ne
 * compile plus.
 */
export const lieuxPourLaListe = async ({
  skip,
  take,
  where,
  orderBy,
}: {
  where: Prisma.LieuInclusionWhereInput
  take?: number
  skip?: number
  orderBy?: Prisma.LieuInclusionOrderByWithRelationInput[]
}): Promise<LigneDeLaListe[]> => {
  const structures = await prismaClient.lieuInclusion.findMany({
    where,
    take,
    skip,
    select: searchStructureSelect,
    orderBy: [...(orderBy ?? []), { nom: 'asc' }],
  })

  // L'identifiant de cartographie vient du registre de l'Entrepôt, qui en est le
  // domicile, et non plus d'une copie tenue par la coop.
  //
  // L'employeuse n'est plus reliée au lieu (ADR-002) : ce compteur n'a plus de
  // quoi se calculer et vaut zéro pour tout le monde.
  return structures.map(({ inscriptionRegistre, ...coop }) => {
    const registre =
      inscriptionRegistre == null ? null : champsDAffichage(inscriptionRegistre)

    return {
      ...coop,
      nom: registre?.nom ?? coop.nom,
      adresse: registre?.adresse ?? coop.adresse,
      commune: registre?.commune ?? coop.commune,
      codePostal: registre?.codePostal ?? coop.codePostal,
      codeInsee: registre?.codeInsee ?? coop.codeInsee,
      typologies: registre?.typologies ?? coop.typologies,
      visiblePourCartographieNationale:
        registre?.visiblePourCartographieNationale ??
        coop.visiblePourCartographieNationale,
      structureCartographieNationaleId:
        registre?.structureCartographieNationaleId ?? null,
      emploisCount: 0,
    }
  })
}
