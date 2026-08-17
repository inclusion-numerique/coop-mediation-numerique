import { prismaClient } from '@app/web/prismaClient'
import { synchroniserCompte } from '../../../implementation/synchroniser-compte.binding'
import type { LancerSynchronisation } from '../domain/declencher-synchronisation'

/**
 * Branchement sur l'orchestrateur de synchronisation historique.
 *
 * Le compte et le médiateur sont relus ici plutôt que passés depuis le domaine :
 * l'ability raisonne sur un `CompteRdv`, qui ne porte pas le médiateur — c'est
 * une donnée de rattachement, pas une donnée de compte.
 */
export const lancerSynchronisation: LancerSynchronisation = async ({
  utilisateurId,
  organisationIds,
}) => {
  const utilisateur = await prismaClient.user.findUniqueOrThrow({
    where: { id: utilisateurId },
    select: {
      mediateur: { select: { id: true } },
      rdvAccount: { select: { id: true } },
    },
  })

  if (utilisateur.rdvAccount === null) {
    return { derive: 0 }
  }

  const { drift } = await synchroniserCompte({
    compteId: utilisateur.rdvAccount.id,
    mediateurId: utilisateur.mediateur?.id,
    organisationIds:
      organisationIds === undefined ? undefined : [...organisationIds],
  })

  return { derive: drift }
}
