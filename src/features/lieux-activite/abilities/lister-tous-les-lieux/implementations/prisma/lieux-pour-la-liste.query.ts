import { prismaClient } from '@/configuration/prisma'
import type { Prisma } from '@/generated/prisma/client'
import {
  champsDAffichage,
  inscriptionPourLaFiche,
} from '../../../../implementations/prisma/registre'
import type { LigneDeLaListe } from '../../domain/ligne-de-la-liste'

const searchStructureSelect = {
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

const identifiantsDeLaPage = async ({
  skip,
  take,
  where,
  orderBy,
}: {
  where: Prisma.LieuInclusionWhereInput
  take?: number
  skip?: number
  orderBy?: Prisma.LieuInclusionOrderByWithRelationInput[]
}): Promise<readonly string[]> =>
  (
    await prismaClient.lieuInclusion.findMany({
      where,
      ...(take === undefined ? {} : { take }),
      ...(skip === undefined ? {} : { skip }),
      select: { id: true },
      orderBy: [...(orderBy ?? []), { nom: 'asc' }, { id: 'asc' }],
    })
  ).map(({ id }) => id)

const dansLOrdreDe =
  (ids: readonly string[]) =>
  (un: { id: string }, autre: { id: string }): number =>
    ids.indexOf(un.id) - ids.indexOf(autre.id)

export const lieuxPourLaListe = async (page: {
  where: Prisma.LieuInclusionWhereInput
  take?: number
  skip?: number
  orderBy?: Prisma.LieuInclusionOrderByWithRelationInput[]
}): Promise<LigneDeLaListe[]> => {
  const ids = await identifiantsDeLaPage(page)

  const structures = (
    await prismaClient.lieuInclusion.findMany({
      where: { id: { in: [...ids] } },
      select: searchStructureSelect,
    })
  ).toSorted(dansLOrdreDe(ids))

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
