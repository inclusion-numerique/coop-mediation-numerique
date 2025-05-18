import type { SessionUser } from '@app/web/auth/sessionUser'
import { getBeneficiaireDisplayName } from '@app/web/beneficiaire/getBeneficiaireDisplayName'
import type { OAuthApiRdvStatus } from '@app/web/rdv-service-public/OAuthRdvApiCallInput'
import { oAuthRdvApiListRdvs } from '@app/web/rdv-service-public/executeOAuthRdvApiCall'
/**
 * Our domain model for reprensenting a list of RDVS owned by OAUTH RDV Service Public
 */
import { getUserContextForOAuthApiCall } from '@app/web/rdv-service-public/getUserContextForRdvApiCall'
import type { Beneficiaire } from '@prisma/client'

export type BeneficiaireRdv = {
  id: number
  durationInMinutes: number
  date: Date
  createdBy: string
  status: OAuthApiRdvStatus
  agents: {
    id: number
    firstName: string
    lastName: string
    displayName: string
    email: string
  }[]
  participations: {
    id: number
    status: OAuthApiRdvStatus
    sendReminderNotification: boolean
    sendLifecycleNotifications: boolean
    user: {
      id: number
      firstName: string
      lastName: string
      displayName: string
      email: string | null
    }
  }[]
}

export const getBeneficiaireRdvsList = async ({
  user,
  beneficiaire,
}: {
  beneficiaire?: Pick<Beneficiaire, 'rdvServicePublicId'>
  user: Pick<SessionUser, 'id' | 'rdvAccount'>
  du: Date | null // TODO implement this
  au: Date | null // TODO implement this
}) => {
  if (!user.rdvAccount) {
    return []
  }

  const oAuthCallUser = await getUserContextForOAuthApiCall({ user })

  const rdvServicePublicRdvs = await oAuthRdvApiListRdvs({
    rdvAccount: oAuthCallUser.rdvAccount,
    beneficiaire,
  })

  return rdvServicePublicRdvs.map(
    ({
      id,
      duration_in_min,
      starts_at,
      agents,
      participations,
      created_by,
      status,
    }) =>
      ({
        id,
        durationInMinutes: duration_in_min,
        date: new Date(starts_at),
        createdBy: created_by,
        status,
        agents: agents.map(({ id: agentId, first_name, last_name, email }) => ({
          id: agentId,
          firstName: first_name,
          lastName: last_name,
          displayName: getBeneficiaireDisplayName({
            prenom: first_name,
            nom: last_name,
          }),
          email,
        })),
        participations: participations.map(
          ({
            user,
            id,
            status,
            send_reminder_notification,
            send_lifecycle_notifications,
          }) => ({
            id,
            sendReminderNotification: send_reminder_notification,
            sendLifecycleNotifications: send_lifecycle_notifications,
            status,
            user: {
              id: user.id,
              firstName: user.first_name,
              lastName: user.last_name,
              displayName: getBeneficiaireDisplayName({
                prenom: user.first_name,
                nom: user.last_name,
              }),
              email: user.email || null,
            },
          }),
        ),
      }) satisfies BeneficiaireRdv,
  )
}
