import { prismaClient } from '@/configuration/prisma/prismaClient'
import { compteRdvToDomain } from '@/features/rdvsp/db'
import type { CompteRdv } from '@/features/rdvsp/domain/compte-rdv'

export const lireLesComptesRdv = async (): Promise<readonly CompteRdv[]> =>
  (
    await prismaClient.rdvAccount.findMany({
      select: {
        id: true,
        userId: true,
        accessToken: true,
        refreshToken: true,
        expiresAt: true,
        scope: true,
        error: true,
        deleted: true,
        syncFrom: true,
        lastSynced: true,
        includeRdvsInActivitesList: true,
        invalidWebhookOrganisationIds: true,
        organisations: { select: { organisationId: true } },
      },
    })
  ).map(compteRdvToDomain)
