import { prismaClient } from '@/configuration/prisma'
import { RdvAgentId } from '../../../../domain/identifiants/rdv-agent-id'
import { RdvId } from '../../../../domain/identifiants/rdv-id'
import { UsagerId } from '../../../../domain/identifiants/usager-id'
import { StatutPresence } from '../../../../domain/rdv/statut-presence'
import { identiteExterneToDomain } from '../../../../implementations/prisma/usager-externe.transfer'
import type { LireRdvPourActivite } from '../../domain/ports'

export const lireRdvPourActivite: LireRdvPourActivite = async (rdvId) => {
  const row = await prismaClient.rdv.findUnique({
    where: { id: rdvId },
    select: {
      id: true,
      rdvAccountId: true,
      status: true,
      startsAt: true,
      durationInMin: true,
      name: true,
      collectif: true,
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
        statutPresence: StatutPresence(row.status),
        debut: row.startsAt,
        dureeEnMinutes: row.durationInMin,
        titre: row.name,
        collectif: row.collectif,
        participations: row.participations.map((participation) => ({
          statutPresence: StatutPresence(participation.status),
          usager: {
            id: UsagerId(participation.user.id),
            ...identiteExterneToDomain(participation.user),
            adresse: participation.user.address,
            dateNaissance: participation.user.birthDate,
          },
        })),
      }
}
