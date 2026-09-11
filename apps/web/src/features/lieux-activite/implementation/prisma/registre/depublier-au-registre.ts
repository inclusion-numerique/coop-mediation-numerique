import type { Prisma } from '@prisma/client'
import { depublicationCoop } from './signature-coop'

/**
 * Retire du partage à la cartographie l'inscription d'un lieu que la coop
 * vient de dépublier.
 *
 * Le seul chemin qui dépublie sans passer par l'interrupteur est le relèvement
 * d'un lieu modéré : il revient invisible, et la décision doit suivre jusqu'au
 * registre — sinon les consommateurs continueraient d'annoncer publié un lieu
 * que la coop a retiré de la carte.
 *
 * `updateMany` et non `update` : un lieu que la coop n'a jamais inscrit n'a pas
 * d'inscription à dépublier, et c'est un cas normal.
 */
export const depublierAuRegistre = async (
  transaction: Prisma.TransactionClient,
  {
    lieuId,
    maintenant,
  }: { readonly lieuId: string; readonly maintenant: Date },
): Promise<void> => {
  await transaction.lieuInclusionRegistreMain.updateMany({
    where: { structureCoopId: lieuId },
    data: depublicationCoop(maintenant),
  })
}
