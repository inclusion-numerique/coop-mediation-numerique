import { prismaClient } from '@app/web/prismaClient'
import { type OAuthRdvApiCredentials } from '@app/web/rdv-service-public/executeOAuthRdvApiCall'
import * as Sentry from '@sentry/nextjs'

export const mergeRdvUserFromRdvPlan = async ({
  rdvPlanUserId,
  beneficiaire: {
    id: beneficiaireId,
    prenom,
    nom,
    email,
    telephone,
    rdvUserId,
  },
}: {
  rdvPlanUserId: number
  rdvAccount: OAuthRdvApiCredentials
  beneficiaire: {
    id: string
    prenom: string | null
    nom: string | null
    email: string | null
    telephone: string | null
    rdvUserId: number | undefined
  }
}) => {
  try {
    // The user from rdvsp is in "limbo" / without organisation so we cannot fetch its data for now

    await prismaClient.$transaction(async (transaction) => {
      // Check if RdvUser already exists
      let rdvUser = await transaction.rdvUser.findUnique({
        where: { id: rdvPlanUserId },
      })

      if (!rdvUser) {
        // Create RdvUser with temporary data, it will be updated later by webhook process
        rdvUser = await transaction.rdvUser.create({
          data: {
            id: rdvPlanUserId,
            firstName: prenom ?? '-',
            lastName: nom ?? '-',
            email: email,
            phoneNumber: telephone,
            notifyByEmail: false,
            notifyBySms: false,
          },
        })
      }

      // Link beneficiaire to RdvUser if not already linked
      if (rdvUserId !== rdvPlanUserId) {
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
