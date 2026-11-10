import { prismaClient } from '@app/web/prismaClient'
import type { MediateurId } from '../../../../domain/mediateur-id'
import {
  champsDAffichage,
  inscriptionPourLaFiche,
} from '../../../../implementation/prisma/registre'

export const listerLesLieuxPourLInscription = async ({
  mediateurId,
}: {
  mediateurId: MediateurId
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
          inscriptionRegistre: inscriptionPourLaFiche,
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

  return enActivite.map(({ lieuInclusion }) => {
    const { inscriptionRegistre, ...coop } = lieuInclusion
    const registre =
      inscriptionRegistre == null ? null : champsDAffichage(inscriptionRegistre)

    return {
      ...coop,
      nom: registre?.nom ?? coop.nom,
      adresse: registre?.adresse ?? coop.adresse,
      complementAdresse: registre?.complementAdresse ?? coop.complementAdresse,
      commune: registre?.commune ?? coop.commune,
      codePostal: registre?.codePostal ?? coop.codePostal,
      codeInsee: registre?.codeInsee ?? coop.codeInsee,
      typologies: registre?.typologies ?? coop.typologies,
      structureCartographieNationaleId:
        registre?.structureCartographieNationaleId ?? null,
    }
  })
}

export type LieuPourLInscription = Awaited<
  ReturnType<typeof listerLesLieuxPourLInscription>
>[number]
