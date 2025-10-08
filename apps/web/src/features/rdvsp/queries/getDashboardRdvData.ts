import { prismaClient } from '@app/web/prismaClient'
import { oAuthRdvApiListRdvs } from '@app/web/rdv-service-public/executeOAuthRdvApiCall'
import { getUserContextForOAuthApiCall } from '@app/web/rdv-service-public/getUserContextForRdvApiCall'
import { OAuthApiRdv } from '@app/web/rdv-service-public/OAuthRdvApiCallInput'
import { dateAsIsoDay } from '@app/web/utils/dateAsIsoDay'
import {
  UserId,
  UserWithExistingMediateur,
  UserWithExistingRdvAccount,
} from '@app/web/utils/user'

const findNextRdv = async ({
  rdvAccountId,
  now,
}: {
  rdvAccountId: number
  now: Date
}) => {
  return prismaClient.rdv.findFirst({
    where: {
      rdvAccountId,
      startsAt: { gte: now },
    },
    select: {
      id: true,
      startsAt: true,
      durationInMin: true,
      endsAt: true,
      status: true,
      participations: {
        select: {
          id: true,
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      },
      lieu: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      startsAt: 'asc',
    },
  })
}

export type NextRdv = Awaited<ReturnType<typeof findNextRdv>>

export type DashboardRdvData = {
  next: NextRdv | null
  futur: number
  passes: number
  honores: number
  organisation: {
    id: number
    name: string
  }
}

export const getDashboardRdvData = async ({
  user,
}: {
  user: UserWithExistingRdvAccount & UserId
}): Promise<DashboardRdvData> => {
  const { rdvAccount } = user

  const now = new Date()

  const [futurRdvsCount, nextRdv, passesCount, crasTodoCount] =
    await Promise.all([
      prismaClient.rdv.count({
        where: {
          rdvAccountId: rdvAccount.id,
          startsAt: {
            gte: now,
          },
        },
      }),
      findNextRdv({
        rdvAccountId: rdvAccount.id,
        now,
      }),
      prismaClient.rdv.count({
        where: {
          rdvAccountId: rdvAccount.id,
          status: 'unknown',
          endsAt: {
            lte: now,
          },
        },
      }),
      prismaClient.rdv.count({
        where: {
          rdvAccountId: rdvAccount.id,
          status: 'seen',
          activite: null,
        },
      }),
    ])

  return {
    next: nextRdv,
    futur: futurRdvsCount,
    passes: passesCount,
    honores: crasTodoCount,
    organisation: rdvAccount.organisations.at(0) ?? { id: 0, name: '' },
  }
}
