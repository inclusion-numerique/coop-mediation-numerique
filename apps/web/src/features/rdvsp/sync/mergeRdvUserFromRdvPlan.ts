import { prismaClient } from '@app/web/prismaClient'
import {
  type OAuthRdvApiCredentials,
  oAuthRdvApiGetUser,
} from '@app/web/rdv-service-public/executeOAuthRdvApiCall'
import * as Sentry from '@sentry/nextjs'

export const mergeRdvUserFromRdvPlan = async ({
  rdvPlanUserId,
  rdvAccount,
  beneficiaireId,
  currentRdvUserId,
}: {
  rdvPlanUserId: number
  rdvAccount: OAuthRdvApiCredentials
  beneficiaireId: string
  currentRdvUserId: number | undefined
}) => {
  try {
    // Fetch the complete user data from RDV Service Public API
    const userResponse = await oAuthRdvApiGetUser({
      userId: String(rdvPlanUserId),
      rdvAccount,
    })

    console.log('Api user response', userResponse)

    if (userResponse.status === 'error') {
      throw new Error(
        `Failed to fetch user from RDV Service Public: ${userResponse.error}`,
      )
    }

    const rdvApiUser = userResponse.data.user
    if (!rdvApiUser) {
      throw new Error('User not found in RDV Service Public response')
    }

    await prismaClient.$transaction(async (transaction) => {
      // Check if RdvUser already exists
      const existingRdvUser = await transaction.rdvUser.findUnique({
        where: { id: rdvPlanUserId },
      })

      if (!existingRdvUser) {
        // Create RdvUser with data from API
        await transaction.rdvUser.create({
          data: {
            id: rdvApiUser.id,
            address: rdvApiUser.address,
            addressDetails: rdvApiUser.address_details,
            affiliationNumber: rdvApiUser.affiliation_number,
            birthDate: rdvApiUser.birth_date
              ? new Date(rdvApiUser.birth_date)
              : null,
            birthName: rdvApiUser.birth_name,
            caisseAffiliation: rdvApiUser.caisse_affiliation,
            createdAt: rdvApiUser.created_at
              ? new Date(rdvApiUser.created_at)
              : null,
            email: rdvApiUser.email,
            firstName: rdvApiUser.first_name,
            invitationAcceptedAt: rdvApiUser.invitation_accepted_at
              ? new Date(rdvApiUser.invitation_accepted_at)
              : null,
            invitationCreatedAt: rdvApiUser.invitation_created_at
              ? new Date(rdvApiUser.invitation_created_at)
              : null,
            lastName: rdvApiUser.last_name,
            notifyByEmail: rdvApiUser.notify_by_email,
            notifyBySms: rdvApiUser.notify_by_sms,
            phoneNumber: rdvApiUser.phone_number,
            phoneNumberFormatted: rdvApiUser.phone_number_formatted,
            responsibleId: rdvApiUser.responsible_id,
          },
        })
      }

      // Link beneficiaire to RdvUser if not already linked
      if (currentRdvUserId !== rdvPlanUserId) {
        await transaction.beneficiaire.update({
          where: { id: beneficiaireId },
          data: { rdvUserId: rdvPlanUserId },
        })
      }
    })
  } catch (error) {
    Sentry.captureException(error)

    // biome-ignore lint/suspicious/noConsole: we log this until feature is not in production
    console.error(error)
    throw new Error(
      "Une erreur est survenue lors de la création du lien entre le bénéficiaire et l'usager RDV Service Public",
    )
  }
}
