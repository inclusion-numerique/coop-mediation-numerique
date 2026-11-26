import { prismaClient } from '@/configuration/prisma'
import type {
  SupprimerLeCompteRdv,
  SupprimerLesUsagers,
} from '../../domain/ports'

export const supprimerLeCompteRdv: SupprimerLeCompteRdv = async (agentId) => {
  await prismaClient.$transaction([
    prismaClient.rdv.deleteMany({ where: { rdvAccountId: agentId } }),
    prismaClient.rdvSyncLog.deleteMany({ where: { rdvAccountId: agentId } }),
    prismaClient.rdvAccountOrganisation.deleteMany({
      where: { accountId: agentId },
    }),
    prismaClient.rdvAccount.delete({ where: { id: agentId } }),
  ])
}

export const supprimerLesUsagers: SupprimerLesUsagers = async (usagerIds) => {
  await prismaClient.rdvUser.deleteMany({
    where: { id: { in: [...usagerIds] } },
  })
}
