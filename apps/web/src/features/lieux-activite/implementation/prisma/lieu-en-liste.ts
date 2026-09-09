import { prismaClient } from '@app/web/prismaClient'
import type { Prisma } from '@prisma/client'
import {
  adresseDeLInscription,
  type InscriptionPourLaFiche,
  inscriptionPourLaFiche,
} from './registre'
import { derniereModificationExterne } from './registre/modification-du-registre'

/**
 * Ce que la coop montre d'un lieu quand elle en montre plusieurs : de quoi le
 * reconnaître, le situer, dire s'il est publié et depuis quand il n'a pas
 * bougé.
 *
 * La projection appartient au lieu, pas aux pages qui l'affichent — l'annuaire
 * du département, mes lieux d'activité et la fiche d'un acteur montrent le même
 * objet, vu depuis trois entrées.
 */
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

/**
 * La ligne de liste, dite depuis le registre.
 *
 * Les clés ne bougent pas — les écrans montrent le même objet — seule la
 * provenance des valeurs change. Ce que le registre ne porte pas, ou porte moins
 * bien que la coop, garde la valeur coop : c'est le même repli que dans
 * `ficheDuRegistre`, et pour les mêmes raisons.
 */
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
    // Le badge est celui du registre quand une source tierce y a écrit après
    // nous ; sinon la colonne coop, qui garde la mémoire des annotations que le
    // job de réconciliation posait avant sa suppression.
    derniereModificationSource:
      externe?._tag === 'ParSource'
        ? externe.source
        : ligne.derniereModificationSource,
    structureCartographieNationaleId:
      inscription.structureCartographieNationaleId,
  }
}

/**
 * La ligne aplatie que les écrans consomment : la fiche vient du registre,
 * l'enveloppe et les compteurs restent ceux de la coop.
 */
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

/** Les lieux où un médiateur exerce, dans la projection des listes. */
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
