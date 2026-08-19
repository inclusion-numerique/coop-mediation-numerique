import { prismaClient } from '@app/web/prismaClient'
import { compteRdvToDomain } from '../../../../db/compte-rdv.transfer'
import type { CompteRdvExistant } from '../../domain/connecter-compte-rdv'

/**
 * Deux clés peuvent désigner le compte à reprendre : l'agent qui vient de
 * s'authentifier, et l'utilisateur La Coop qui pilote la connexion. Elles
 * divergent quand un médiateur relie un second compte RDV Service Public, ou
 * qu'un agent change de compte La Coop — d'où la recherche sur l'une **ou**
 * l'autre, comme le faisait la route de callback.
 */
export const compteRdvExistant: CompteRdvExistant = async ({
  agentId,
  utilisateurId,
}) => {
  const row = await prismaClient.rdvAccount.findFirst({
    where: { OR: [{ id: agentId }, { userId: utilisateurId }] },
    include: { organisations: { select: { organisationId: true } } },
  })

  return row === null ? null : compteRdvToDomain(row)
}
