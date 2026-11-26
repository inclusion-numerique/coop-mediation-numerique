import { prismaClient } from '@/configuration/prisma'
import { RdvAgentId } from '../../../../domain/identifiants/rdv-agent-id'
import { RdvId } from '../../../../domain/identifiants/rdv-id'
import { UsagerId } from '../../../../domain/identifiants/usager-id'
import { jetonsCompteToDomain } from '../../../../implementations/prisma/compte-rdv.transfer'
import type {
  CompteAEffacer,
  RendezVousDuCompte,
  UsagersOrphelinsParmi,
} from '../../domain/ports'

export const compteAEffacer: CompteAEffacer = async (utilisateurId) => {
  const compte = await prismaClient.rdvAccount.findUnique({
    where: { userId: utilisateurId },
    select: {
      id: true,
      accessToken: true,
      refreshToken: true,
      expiresAt: true,
      scope: true,
    },
  })

  return compte === null
    ? null
    : { agentId: RdvAgentId(compte.id), jetons: jetonsCompteToDomain(compte) }
}

export const rendezVousDuCompte: RendezVousDuCompte = async (agentId) => {
  const rdvs = await prismaClient.rdv.findMany({
    where: { rdvAccountId: agentId },
    select: { id: true, participations: { select: { userId: true } } },
  })

  return {
    rdvIds: rdvs.map(({ id }) => RdvId(id)),
    usagerIds: [
      ...new Set(
        rdvs.flatMap(({ participations }) =>
          participations.map(({ userId }) => userId),
        ),
      ),
    ].map((id) => UsagerId(id)),
  }
}

export const usagersOrphelinsParmi: UsagersOrphelinsParmi = async (usagerIds) =>
  (
    await prismaClient.rdvUser.findMany({
      where: {
        id: { in: [...usagerIds] },
        participations: { none: {} },
        beneficiaires: { none: {} },
        dependents: { none: {} },
      },
      select: { id: true },
    })
  ).map(({ id }) => UsagerId(id))
