import { prismaClient } from '@app/web/prismaClient'

/**
 * Coupe les rattachements d'un médiateur à ses lieux d'activité.
 *
 * Suppression et non pose d'une date de fin : le contrat de résurrection dit que
 * les rattachements ne reviennent pas. Une personne qui revient redéclare où
 * elle exerce, ce qui est de toute façon la seule information à jour.
 *
 * Effet à connaître : si le compte portait le dernier rattachement vivant d'un
 * lieu, ce lieu sort de la cartographie nationale — la requête de publication
 * n'expose que les lieux ayant au moins un rattachement sans date de fin.
 *
 * Idempotent : une seconde exécution ne trouve plus rien à supprimer.
 */
export const retirerDesLieux = async ({
  mediateurId,
}: {
  readonly mediateurId: string
}): Promise<{ readonly rattachementsSupprimes: number }> => {
  const { count } = await prismaClient.mediateurEnActivite.deleteMany({
    where: { mediateurId },
  })

  return { rattachementsSupprimes: count }
}
