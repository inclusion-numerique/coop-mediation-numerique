import type { SessionUser } from '@app/web/auth/sessionUser'
import { getBeneficiaireDisplayName } from '@app/web/beneficiaire/getBeneficiaireDisplayName'
import { oAuthRdvApiListRdvs } from '@app/web/rdv-service-public/executeOAuthRdvApiCall'
/**
 * Our domain model for reprensenting a list of RDVS owned by OAUTH RDV Service Public
 */
import { getUserContextForOAuthApiCall } from '@app/web/rdv-service-public/getUserContextForRdvApiCall'
import { Beneficiaire } from '@prisma/client'

export const getBeneficiaireRdvsList = async ({
  user,
  beneficiaire,
}: {
  beneficiaire: Pick<Beneficiaire, 'rdvServicePublicId'>
  user: Pick<SessionUser, 'id' | 'rdvAccount'>
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
    ({ id, duration_in_min, starts_at, agents }) => ({
      id,
      durationInMinutes: duration_in_min,
      date: new Date(starts_at),
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
    }),
  )
}

export type BeneficiaireRdv = Awaited<
  ReturnType<typeof getBeneficiaireRdvsList>
>[number]
