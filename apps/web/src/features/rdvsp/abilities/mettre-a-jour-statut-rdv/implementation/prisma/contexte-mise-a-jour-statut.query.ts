import { prismaClient } from '@app/web/prismaClient'
import { compteRdvToDomain } from '../../../../db'
import { RdvAgentId } from '../../../../domain/rdv-agent-id'
import type { ContexteMiseAJourStatut } from '../../domain/mettre-a-jour-statut-rdv'

/**
 * Lit le compte du médiateur et le propriétaire du rendez-vous visé. La requête
 * ne tranche rien : elle rapporte les deux faits, `verifierAcces` en tire
 * l'autorisation. Le rendez-vous est donc cherché sans filtre de propriétaire, à
 * dessein — c'est ce qui permet de distinguer « ce rendez-vous n'existe pas » de
 * « ce rendez-vous n'est pas le vôtre », deux refus qu'un `where` combiné
 * confondrait.
 */
export const contexteMiseAJourStatut: ContexteMiseAJourStatut = async ({
  utilisateurId,
  rdvId,
}) => {
  const [compteRow, rdvRow] = await Promise.all([
    prismaClient.rdvAccount.findUnique({
      where: { userId: utilisateurId },
      include: { organisations: { select: { organisationId: true } } },
    }),
    prismaClient.rdv.findUnique({
      where: { id: rdvId },
      select: { rdvAccountId: true },
    }),
  ])

  return {
    compte: compteRow === null ? null : compteRdvToDomain(compteRow),
    agentIdDuRdv: rdvRow === null ? null : RdvAgentId(rdvRow.rdvAccountId),
  }
}
