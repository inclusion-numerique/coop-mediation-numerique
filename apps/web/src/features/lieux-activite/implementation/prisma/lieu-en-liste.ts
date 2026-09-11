import { prismaClient } from '@app/web/prismaClient'
import type { Prisma } from '@prisma/client'
import {
  adresseDeLInscription,
  type InscriptionPourLaFiche,
  inscriptionPourLaFiche,
} from './registre'
import { derniereModificationExterne } from './registre/modification-du-registre'

export const projectionDuLieuEnListe = {
  id: true,
  nom: true,
  nomUsage: true,
  adresse: true,
  complementAdresse: true,
  commune: true,
  codePostal: true,
  codeInsee: true,
  modification: true,
  derniereModificationPar: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      name: true,
      email: true,
    },
  },
  derniereModificationSource: true,
  visiblePourCartographieNationale: true,
  inscriptionRegistre: inscriptionPourLaFiche,
  _count: {
    select: {
      mediateursEnActivite: {
        where: {
          suppression: null,
          fin: null,
          mediateur: { user: { deleted: null } },
        },
      },
    },
  },
} satisfies Prisma.LieuInclusionSelect

type LigneEnListe = Prisma.LieuInclusionGetPayload<{
  select: typeof projectionDuLieuEnListe
}>

const depuisLInscription = (
  ligne: LigneEnListe,
  inscription: InscriptionPourLaFiche,
) => {
  const adresse = adresseDeLInscription(inscription)
  const externe = derniereModificationExterne(inscription, ligne.modification)

  return {
    nom: inscription.nom,
    nomUsage: inscription.nomUsage ?? ligne.nomUsage,
    adresse: adresse?.voie ?? ligne.adresse,
    complementAdresse: adresse?.complement_adresse ?? ligne.complementAdresse,
    commune: adresse?.commune ?? ligne.commune,
    codePostal: adresse?.code_postal ?? ligne.codePostal,
    codeInsee: adresse?.code_insee ?? ligne.codeInsee,
    visiblePourCartographieNationale:
      inscription.visiblePourCartographieNationale ??
      ligne.visiblePourCartographieNationale,
    derniereModificationSource:
      externe?._tag === 'ParSource'
        ? externe.source
        : ligne.derniereModificationSource,
    structureCartographieNationaleId:
      inscription.structureCartographieNationaleId,
  }
}

export const avecLaFicheDuRegistre = (ligne: LigneEnListe) => {
  const { inscriptionRegistre, ...reste } = ligne

  return {
    ...reste,
    ...(inscriptionRegistre == null
      ? { structureCartographieNationaleId: null }
      : depuisLInscription(ligne, inscriptionRegistre)),
  }
}

export type LieuEnListe = ReturnType<typeof avecLaFicheDuRegistre>

export const lieuxEnListeDuMediateur = async ({
  mediateurId,
}: {
  mediateurId: string
}): Promise<LieuEnListe[]> =>
  (
    await prismaClient.lieuInclusion.findMany({
      where: {
        mediateursEnActivite: {
          some: { mediateurId, suppression: null, fin: null },
        },
      },
      select: projectionDuLieuEnListe,
    })
  ).map(avecLaFicheDuRegistre)
