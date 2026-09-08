import { prismaClient } from '@app/web/prismaClient'
import type { Prisma } from '@prisma/client'
import { avecIdentifiantCarto } from './registre/identifiants-carto'

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

/**
 * L'identifiant de cartographie ne vient plus de la colonne coop mais du
 * registre de l'Entrepôt, greffé après lecture par `avecIdentifiantCarto`. Il
 * garde son nom : ce qui change est sa provenance, pas ce que les écrans en
 * font.
 */
export type LieuEnListe = Prisma.LieuInclusionGetPayload<{
  select: typeof projectionDuLieuEnListe
}> & { readonly structureCartographieNationaleId: string | null }

/** Les lieux où un médiateur exerce, dans la projection des listes. */
export const lieuxEnListeDuMediateur = async ({
  mediateurId,
}: {
  mediateurId: string
}): Promise<LieuEnListe[]> =>
  avecIdentifiantCarto(
    await prismaClient.lieuInclusion.findMany({
      where: {
        mediateursEnActivite: {
          some: { mediateurId, suppression: null, fin: null },
        },
      },
      select: projectionDuLieuEnListe,
    }),
  )
