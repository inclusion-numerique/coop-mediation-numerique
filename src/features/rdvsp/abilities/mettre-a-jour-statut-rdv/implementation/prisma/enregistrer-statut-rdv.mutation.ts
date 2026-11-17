import { prismaClient } from '@app/web/prismaClient'
import type { EnregistrerStatutRdv } from '../../domain/mettre-a-jour-statut-rdv'

/**
 * L'autorisation a déjà été établie par `verifierAcces` : la mutation cible le
 * rendez-vous par son seul identifiant, comme un ordre déjà validé.
 */
export const enregistrerStatutRdv: EnregistrerStatutRdv = async ({
  rdvId,
  statut,
}) => {
  await prismaClient.rdv.update({
    where: { id: rdvId },
    data: {
      status: statut.statutPresence,
      compteRenduRegle: statut.compteRenduRegle,
    },
  })
}
