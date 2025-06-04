import type { SessionUser } from '@app/web/auth/sessionUser'
import { getBeneficiaireDisplayName } from '@app/web/beneficiaire/getBeneficiaireDisplayName'
import { prismaClient } from '@app/web/prismaClient'
import type { OAuthApiRdvStatus } from '@app/web/rdv-service-public/OAuthRdvApiCallInput'
import { oAuthRdvApiListRdvs } from '@app/web/rdv-service-public/executeOAuthRdvApiCall'
import { getUserContextForOAuthApiCall } from '@app/web/rdv-service-public/getUserContextForRdvApiCall'
import { rdvServicePublicOAuthConfig } from '@app/web/rdv-service-public/rdvServicePublicOauth'
import { dateAsIsoDay } from '@app/web/utils/dateAsIsoDay'
import type { UserId, UserRdvAccount } from '@app/web/utils/user'
import type { Beneficiaire } from '@prisma/client'

// Représente un bénéficiaire suivi côté coop qu'on a lié à un user de RDVSP
export type RdvUserBeneficiaire = {
  id: string
  prenom: string
  nom: string
  mediateurId: string
}

/**
 * Our domain model for reprensenting a list of RDVS owned by OAUTH RDV Service Public
 */
export type Rdv = {
  id: number
  durationInMinutes: number
  date: Date
  createdBy: string
  status: OAuthApiRdvStatus
  motif: {
    id: number
    name: string
  }
  url: string
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
      beneficiaire: RdvUserBeneficiaire | null // coop uuidv4 du bénéficiaire suivi
    }
  }[]
}

export const getRdvs = async ({
  user,
  beneficiaire,
  du,
  au,
  organisationId,
  onlyForUser,
}: {
  beneficiaire?: Pick<Beneficiaire, 'rdvServicePublicId'>
  user: UserRdvAccount & UserId
  onlyForUser: boolean // this will filter on rdvs for the User (RDV Agent) only
  du?: Date | null
  au?: Date | null
  organisationId?: number // Id of organisation in RDV Service Public
}) => {
  if (!user.rdvAccount) {
    return []
  }

  const oAuthCallUser = await getUserContextForOAuthApiCall({ user })

  const rdvServicePublicRdvs = await oAuthRdvApiListRdvs({
    rdvAccount: oAuthCallUser.rdvAccount,
    userId: beneficiaire?.rdvServicePublicId ?? undefined,
    agentId: onlyForUser ? user.rdvAccount.id : undefined,
    startsAfter: du ? dateAsIsoDay(du) : undefined,
    startsBefore: au ? dateAsIsoDay(au) : undefined,
    organisationId,
  })

  const beneficiairesRdvs = rdvServicePublicRdvs.map(
    ({
      id,
      duration_in_min,
      starts_at,
      agents,
      participations,
      created_by,
      status,
      motif,
      url_for_agents,
    }) =>
      ({
        id,
        url: url_for_agents,
        durationInMinutes: duration_in_min,
        date: new Date(starts_at),
        createdBy: created_by,
        status,
        motif: {
          id: motif.id,
          name: motif.name,
        },
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
              beneficiaire: null as RdvUserBeneficiaire | null,
            },
          }),
        ),
      }) satisfies Rdv,
  )

  // beneficiaire ids côté RDVSP
  const rdvUserIds = beneficiairesRdvs.flatMap(({ participations }) =>
    participations.map(({ user }) => user.id),
  )

  // beneficiaire suivis côté coop avec un lien d'id avec RDVSP
  const beneficiaires = await prismaClient.beneficiaire.findMany({
    where: {
      rdvServicePublicId: { in: rdvUserIds },
    },
    select: {
      id: true,
      rdvServicePublicId: true,
      mediateurId: true,
      prenom: true,
      nom: true,
      email: true,
      telephone: true,
    },
  })

  // Map beneficiaire ids for o(1) lookup
  const beneficiaireMap = new Map(
    beneficiaires.map((beneficiaire) => [
      beneficiaire.rdvServicePublicId,
      beneficiaire,
    ]),
  )

  // Update beneficiaireId in beneficiairesRdvs
  for (const { participations } of beneficiairesRdvs) {
    for (const { user } of participations) {
      const beneficiaire = beneficiaireMap.get(user.id)
      if (beneficiaire) {
        user.beneficiaire = {
          id: beneficiaire.id,
          prenom: beneficiaire.prenom ?? '',
          nom: beneficiaire.nom ?? '',
          mediateurId: beneficiaire.mediateurId,
        }
      }
    }
  }

  return beneficiairesRdvs
}
