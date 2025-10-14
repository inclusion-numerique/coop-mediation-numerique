import { PrismaSessionUser } from '@app/web/auth/getSessionUserFromSessionToken'
import { serializePrismaSessionUser } from '@app/web/auth/serializePrismaSessionUser'
import { prismaClient } from '@app/web/prismaClient'
import { getRdvs } from '@app/web/rdv-service-public/getRdvs'

export const getAdministrationRdvspData = async () => {
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
          expiresAt: true,
          accessToken: true,
          refreshToken: true,
          error: true,
          syncFrom: true,
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
      } => user.rdvAccount !== null, // only here for typescript safety, it is guaranteed by the query where clause
    )
    .sort(
      // sort by number of rdvs descending
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
        hasOauthTokens: !!user.rdvAccount?.accessToken,
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

export type AdministrationRdvspData = Awaited<
  ReturnType<typeof getAdministrationRdvspData>
>
