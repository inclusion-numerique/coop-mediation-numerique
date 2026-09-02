import { prismaClient } from '@app/web/prismaClient'
import { lieuToDomain } from '../../../../db'
import type { Lieu } from '../../../../domain/lieu'
import type { LieuId } from '../../../../domain/lieu-id'

export type FicheDuLieu = {
  readonly lieu: Lieu
  readonly auteurDerniereModification: string | null
}

/**
 * Le nom d'affichage de l'auteur, recomposé ici plutôt qu'emprunté à
 * `mon-reseau` : trois lignes dupliquées valent mieux qu'une dépendance entre
 * features (IS-1).
 */
const nomAffiche = (auteur: {
  name: string | null
  firstName: string | null
  lastName: string | null
  email: string
}): string =>
  auteur.name ??
  (auteur.firstName && auteur.lastName
    ? `${auteur.firstName} ${auteur.lastName}`
    : auteur.email)

export const consulterLaFicheDuLieu = async (
  id: LieuId,
): Promise<FicheDuLieu | null> => {
  const ligne = await prismaClient.lieuInclusion.findFirst({
    where: { id, suppression: null },
    include: {
      derniereModificationPar: {
        select: { name: true, firstName: true, lastName: true, email: true },
      },
    },
  })

  if (ligne == null) return null

  const { derniereModificationPar, ...lieu } = ligne

  return {
    lieu: lieuToDomain(lieu),
    auteurDerniereModification:
      derniereModificationPar == null
        ? null
        : nomAffiche(derniereModificationPar),
  }
}
