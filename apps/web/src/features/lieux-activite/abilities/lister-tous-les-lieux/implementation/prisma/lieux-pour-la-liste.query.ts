import type { Prisma } from '@app/web/generated/prisma/client'
import { prismaClient } from '@app/web/prismaClient'
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
  banId: true,
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

  return structures.map(({ inscriptionRegistre, banId, ...coop }) => {
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
      structureCartographieNationaleId:
        registre?.structureCartographieNationaleId ?? null,
      adresseAPreciser: banId == null,
    }
  })
}
