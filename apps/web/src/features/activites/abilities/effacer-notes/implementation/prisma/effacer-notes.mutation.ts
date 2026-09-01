import { prismaClient } from '@app/web/prismaClient'

/**
 * Vide le texte libre des comptes rendus d'une personne, sans supprimer les
 * lignes.
 *
 * Les notes sont saisies à la main : c'est là que l'identité d'un bénéficiaire
 * finit par se retrouver, malgré les champs prévus pour elle. Les lignes, elles,
 * restent — ce sont elles qui portent l'historique statistique que la
 * résurrection d'un compte promet de rendre.
 *
 * Les activités de coordination sont traitées de la même façon : un coordinateur
 * n'a pas moins de texte libre qu'un médiateur.
 *
 * Idempotent : le filtre `notes: { not: null }` rend le second passage vide.
 */
export const effacerNotes = async ({
  mediateurId,
  coordinateurId,
}: {
  readonly mediateurId: string | null
  readonly coordinateurId: string | null
}): Promise<{ readonly effacees: number }> => {
  const activites =
    mediateurId === null
      ? { count: 0 }
      : await prismaClient.activite.updateMany({
          where: { mediateurId, notes: { not: null } },
          data: { notes: null },
        })

  const coordination =
    coordinateurId === null
      ? { count: 0 }
      : await prismaClient.activiteCoordination.updateMany({
          where: { coordinateurId, notes: { not: null } },
          data: { notes: null },
        })

  return { effacees: activites.count + coordination.count }
}
