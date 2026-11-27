import { prismaClient } from '@/configuration/prisma'
import { santeDuCompte } from '@/features/rdvsp/domain/compte/sante-compte'
import { compteRdvToDomain } from '@/features/rdvsp/implementations/prisma/compte-rdv.transfer'
import type { ComptesAdministres } from '../../domain/comptes-administres'

export const comptesRdv = async (): Promise<ComptesAdministres> => {
  const maintenant = new Date()

  const usersWithRdvspData = await prismaClient.user.findMany({
    where: {
      rdvAccount: {
        isNot: null,
      },
    },
    select: {
      id: true,
      name: true,
      email: true,
      rdvAccount: {
        select: {
          _count: {
            select: {
              rdvs: true,
            },
          },
          syncLogs: {
            select: {
              id: true,
              started: true,
              ended: true,
              error: true,
              drift: true,
            },
            take: 1,
            orderBy: {
              started: 'desc',
            },
          },
          id: true,
          userId: true,
          expiresAt: true,
          accessToken: true,
          refreshToken: true,
          scope: true,
          error: true,
          deleted: true,
          created: true,
          updated: true,
          lastSynced: true,
          metadata: true,
          syncFrom: true,
          invalidWebhookOrganisationIds: true,
          includeRdvsInActivitesList: true,
          organisations: {
            select: {
              organisation: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      },
    },
  })

  const users = usersWithRdvspData
    .filter(
      (
        user,
      ): user is typeof user & {
        rdvAccount: NonNullable<typeof user.rdvAccount>
      } => user.rdvAccount !== null,
    )
    .sort(
      (a, b) =>
        (b.rdvAccount._count.rdvs ?? 0) - (a.rdvAccount._count.rdvs ?? 0),
    )
    .map((user) => {
      const lastSyncRaw = user.rdvAccount?.syncLogs.at(0)
      const lastSync = lastSyncRaw
        ? {
            ...lastSyncRaw,
            duration: lastSyncRaw.ended
              ? Math.round(
                  (lastSyncRaw.ended.getTime() -
                    lastSyncRaw.started.getTime()) /
                    1000,
                )
              : null,
          }
        : null

      return {
        ...user,
        sante: santeDuCompte(
          compteRdvToDomain({
            ...user.rdvAccount,
            organisations: user.rdvAccount.organisations.map(
              ({ organisation }) => ({ organisationId: organisation.id }),
            ),
          }),
          maintenant,
        ),
        rdvAccount: {
          ...user.rdvAccount,
          lastSync,
        },
      }
    })

  const rdvsTotalCount = users.reduce(
    (acc, user) => acc + (user.rdvAccount._count.rdvs ?? 0),
    0,
  )

  return {
    users,
    rdvs: {
      total: rdvsTotalCount,
    },
  }
}
