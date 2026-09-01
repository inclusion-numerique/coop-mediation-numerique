import { prismaClient } from '@app/web/prismaClient'

/**
 * Anonymise TOUT le portefeuille d'un médiateur, à la suppression de son compte.
 *
 * Même effacement que la suppression de bénéficiaires à l'unité — identité
 * effacée, valeur statistique conservée : année de naissance, commune, genre,
 * tranche d'âge et statut social restent, parce que les accompagnements qui s'y
 * rattachent doivent continuer de compter dans les statistiques territoriales.
 *
 * `rdvUserId` est détaché ici, et c'est ce détachement qui rend les usagers RDV
 * Service Public orphelins : sans lui, la charge RDV qui suit n'aurait rien à
 * supprimer.
 *
 * Idempotent : le filtre `suppression: null` rend le second passage vide, et le
 * compteur est POSÉ à zéro plutôt que décrémenté.
 */
export const anonymiserPortefeuille = async ({
  mediateurId,
  maintenant = new Date(),
}: {
  readonly mediateurId: string
  readonly maintenant?: Date
}): Promise<{ readonly anonymises: number }> => {
  const { count } = await prismaClient.beneficiaire.updateMany({
    where: { mediateurId, suppression: null },
    data: {
      anonyme: true,
      suppression: maintenant,
      modification: maintenant,
      rdvUserId: null,
      prenom: null,
      nom: null,
      telephone: null,
      email: null,
      notes: null,
      adresse: null,
      pasDeTelephone: null,
    },
  })

  await prismaClient.mediateur.update({
    where: { id: mediateurId },
    data: { beneficiairesCount: 0 },
  })

  return { anonymises: count }
}
