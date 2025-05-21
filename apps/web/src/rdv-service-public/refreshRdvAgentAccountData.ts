import { prismaClient } from '@app/web/prismaClient'
import {
  OAuthRdvApiCredentials,
  oAuthRdvApiGetOrganisations,
  oAuthRdvApiMe,
} from '@app/web/rdv-service-public/executeOAuthRdvApiCall'

/**
 * Sync external RDV Service Public data with our database (as a cache)
 */
export const refreshRdvAgentAccountData = async ({
  rdvAccount,
}: {
  rdvAccount: OAuthRdvApiCredentials
}) => {
  // Get agent data to be sure that the account is still linked to the user
  // Get organisations to have a "cache" of the status of the account
  const [{ agent }, { organisations }] = await Promise.all([
    oAuthRdvApiMe({
      rdvAccount,
    }),
    oAuthRdvApiGetOrganisations({
      rdvAccount,
    }),
  ])

  const result = await prismaClient.$transaction(async (transaction) => {
    await transaction.rdvOrganisation.deleteMany({
      where: {
        accountId: agent.id,
      },
    })

    await transaction.rdvOrganisation.createMany({
      data: organisations.map((organisation) => ({
        id: organisation.id,
        accountId: agent.id,
        name: organisation.name,
        email: organisation.email,
        phoneNumber: organisation.phone_number,
      })),
    })

    const updatedAccount = await transaction.rdvAccount.update({
      where: { id: rdvAccount.id },
      data: {
        updated: new Date(),
      },
      include: {
        organisations: true,
      },
    })

    return { rdvAccount: updatedAccount }
  })

  return result
}
