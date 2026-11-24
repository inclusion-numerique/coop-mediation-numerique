import { prismaClient } from '@/configuration/prisma/prisma-client'
import type { CompteRdv } from '@/features/rdvsp/domain/compte/compte-rdv'
import { compteRdvToDomain } from '@/features/rdvsp/implementations/prisma/compte-rdv.transfer'

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
