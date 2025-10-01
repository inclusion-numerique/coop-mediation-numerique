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

export type DashboardRdvData = {
  next: OAuthApiRdv | null
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
  user: UserWithExistingRdvAccount & UserId & UserWithExistingMediateur
}): Promise<DashboardRdvData> => {
  const { rdvAccount, mediateur } = user

  const oAuthCallUser = await getUserContextForOAuthApiCall({ user })

  const now = new Date()

  // try to fetch the next rdv in the agent's agenda
  const [futurRdvs, previousRdvs] = await Promise.all([
    oAuthRdvApiListRdvs({
      rdvAccount: oAuthCallUser.rdvAccount,
      params: {
        agent_id: rdvAccount.id,
        starts_after: dateAsIsoDay(now),
      },
      onlyFirstPage: true,
    }),
    // todo only status seen rdvs
    oAuthRdvApiListRdvs({
      rdvAccount: oAuthCallUser.rdvAccount,
      params: {
        agent_id: user.rdvAccount.id,
        starts_before: dateAsIsoDay(now),
      },
    }),
  ])
  const next = futurRdvs.rdvs.at(0) ?? null
  const futur = futurRdvs.meta.total_count

  const previousUnknown = previousRdvs.rdvs.filter(
    (rdv) => rdv.status === 'unknown',
  )

  const activitesWithRdv = await prismaClient.activite.findMany({
    where: {
      rdvServicePublicId: {
        not: null,
      },
      mediateurId: mediateur.id,
      suppression: null,
    },
    select: {
      rdvServicePublicId: true,
    },
  })

  const activiteRdvIds = new Set(
    activitesWithRdv.map((activite) => activite.rdvServicePublicId),
  )

  const previousHonoresToComplete = previousRdvs.rdvs.filter(
    (rdv) => rdv.status === 'seen' && !activiteRdvIds.has(rdv.id),
  )

  const organisation =
    previousRdvs.rdvs.at(0)?.organisation ??
    futurRdvs.rdvs.at(0)?.organisation ??
    user.rdvAccount.organisations.at(0)

  return {
    next,
    futur,
    passes: previousUnknown.length,
    honores: previousHonoresToComplete.length,
    organisation: organisation ?? { id: 0, name: '' },
  }
}
