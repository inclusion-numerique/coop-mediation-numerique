import { getBeneficiaireDisplayName } from '@app/web/beneficiaire/getBeneficiaireDisplayName'
import { RdvStatusFilterValue } from '@app/web/features/activites/use-cases/list/validation/ActivitesFilters'
import { prismaClient } from '@app/web/prismaClient'
import { oAuthRdvApiListRdvs } from '@app/web/rdv-service-public/executeOAuthRdvApiCall'
import { getUserContextForOAuthApiCall } from '@app/web/rdv-service-public/getUserContextForRdvApiCall'
import { dateAsIsoDay } from '@app/web/utils/dateAsIsoDay'
import type { UserId, UserRdvAccount } from '@app/web/utils/user'
import type { Beneficiaire } from '@prisma/client'
import type { Rdv, RdvUserBeneficiaire } from './Rdv'

export const getRdvs = async ({
  user,
  beneficiaire,
  du,
  au,
  organisationId,
  onlyForUser,
  statuses,
}: {
  beneficiaire?: Pick<Beneficiaire, 'rdvServicePublicId'>
  user: UserRdvAccount & UserId
  onlyForUser: boolean // this will filter on rdvs for the User (RDV Agent) only
  du?: Date | null
  au?: Date | null
  organisationId?: number // Id of organisation in RDV Service Public
  statuses?: RdvStatusFilterValue[]
}) => {
  if (!user.rdvAccount) {
    return []
  }

  if (beneficiaire && beneficiaire.rdvServicePublicId === null) {
    return []
  }

  const shouldFilterStatuses =
    (statuses?.length ?? 0) > 0 && !statuses?.includes('tous')

  const oAuthCallUser = await getUserContextForOAuthApiCall({ user })

  const rdvServicePublicRdvs = await oAuthRdvApiListRdvs({
    rdvAccount: oAuthCallUser.rdvAccount,
    params: {
      user_id: beneficiaire?.rdvServicePublicId ?? undefined,
      agent_id: onlyForUser ? user.rdvAccount.id : undefined,
      starts_after: du ? dateAsIsoDay(du) : undefined,
      starts_before: au ? dateAsIsoDay(au) : undefined,
      organisation_id: organisationId,
    },
  })

  const now = Date.now()

  const beneficiairesRdvs = rdvServicePublicRdvs.rdvs
    .map(
      ({
        id,
        duration_in_min,
        starts_at,
        agents,
        participations,
        created_by,
        status,
        motif,
        name,
        max_participants_count,
        organisation,
        url_for_agents,
      }) => {
        const startDate = new Date(starts_at)
        const endDate = new Date(
          startDate.getTime() + duration_in_min * 60 * 1000,
        )

        return {
          id,
          url: url_for_agents,
          durationInMinutes: duration_in_min,
          date: startDate,
          endDate,
          createdBy: created_by,
          status,
          badgeStatus:
            status === 'unknown' && endDate.getTime() <= now ? 'past' : status,
          organisation: {
            id: organisation.id,
            name: organisation.name,
          },
          maxParticipantsCount: max_participants_count,
          name,
          motif: {
            id: motif.id,
            name: motif.name,
            collectif: motif.collectif,
          },
          agents: agents.map(
            ({ id: agentId, first_name, last_name, email }) => ({
              id: agentId,
              firstName: first_name,
              lastName: last_name,
              displayName: getBeneficiaireDisplayName({
                prenom: first_name,
                nom: last_name,
              }),
              email,
            }),
          ),
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
        } satisfies Rdv
      },
    )
    .filter((rdv) => {
      if (!shouldFilterStatuses) {
        return true
      }

      return statuses?.includes(rdv.badgeStatus)
    })

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

  return beneficiairesRdvs.sort((a, b) => a.date.getTime() - b.date.getTime())
}
