import { prismaClient } from '@app/web/prismaClient'

export const getAdministrationRdvspUserData = async ({
  userId,
}: {
  userId: string
}) => {
  const user = await prismaClient.user.findUnique({
    where: { id: userId },
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
              log: true,
              rdvsCount: true,
              rdvsDrift: true,
              rdvsNoop: true,
              rdvsCreated: true,
              rdvsUpdated: true,
              rdvsDeleted: true,
              organisationsCount: true,
              organisationsDrift: true,
              organisationsNoop: true,
              organisationsCreated: true,
              organisationsUpdated: true,
              organisationsDeleted: true,
              webhooksCount: true,
              webhooksDrift: true,
              webhooksNoop: true,
              webhooksCreated: true,
              webhooksUpdated: true,
              webhooksDeleted: true,
              usersCount: true,
              usersDrift: true,
              usersNoop: true,
              usersCreated: true,
              usersUpdated: true,
              usersDeleted: true,
              motifsCount: true,
              motifsDrift: true,
              motifsNoop: true,
              motifsCreated: true,
              motifsUpdated: true,
              motifsDeleted: true,
              lieuxCount: true,
              lieuxDrift: true,
              lieuxNoop: true,
              lieuxCreated: true,
              lieuxUpdated: true,
              lieuxDeleted: true,
            },
            take: 5,
            orderBy: {
              started: 'desc',
            },
          },
          id: true,
          created: true,
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

  if (!user || !user.rdvAccount) {
    return null
  }

  return {
    user: { ...user, rdvAccount: user.rdvAccount },
  }
}

export type AdministrationRdvspUserData = NonNullable<
  Awaited<ReturnType<typeof getAdministrationRdvspUserData>>
>
