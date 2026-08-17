import { prismaClient } from '@app/web/prismaClient'
import { RdvAgentId } from '../../../../domain/rdv-agent-id'
import { RdvId } from '../../../../domain/rdv-id'
import { StatutPresence } from '../../../../domain/statut-presence'
import { UsagerId } from '../../../../domain/usager-id'
import type { LireRdvPourActivite } from '../../domain/creer-activite-depuis-rdv'

/**
 * Lit le rendez-vous et ses participants sans filtre de propriétaire : c'est
 * `verifierRdv` qui tranche, et c'est ce qui permet de distinguer un rendez-vous
 * inconnu de celui d'un collègue.
 */
export const lireRdvPourActivite: LireRdvPourActivite = async (rdvId) => {
  const row = await prismaClient.rdv.findUnique({
    where: { id: rdvId },
    select: {
      id: true,
      rdvAccountId: true,
      participations: {
        select: {
          status: true,
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phoneNumber: true,
              address: true,
              birthDate: true,
            },
          },
        },
      },
    },
  })

  return row === null
    ? null
    : {
        id: RdvId(row.id),
        agentId: RdvAgentId(row.rdvAccountId),
        participations: row.participations.map((participation) => ({
          statutPresence: StatutPresence(participation.status),
          usager: {
            id: UsagerId(participation.user.id),
            prenom: participation.user.firstName,
            nom: participation.user.lastName,
            email: participation.user.email,
            telephone: participation.user.phoneNumber,
            adresse: participation.user.address,
            dateNaissance: participation.user.birthDate,
          },
        })),
      }
}
