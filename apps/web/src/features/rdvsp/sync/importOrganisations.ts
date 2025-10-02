import {
  OAuthRdvApiCredentialsWithId,
  oAuthRdvApiGetOrganisations,
} from '@app/web/rdv-service-public/executeOAuthRdvApiCall'

export const importOrganisations = async ({
  rdvAccount,
}: {
  rdvAccount: OAuthRdvApiCredentialsWithId
}) => {
  const { organisations } = await oAuthRdvApiGetOrganisations({
    rdvAccount,
  })

  await prismaClient.$transaction(async (tx) => {
    await tx.rdvOrganisation.deleteMany({
      where: {
        accountId: rdvAccount.id,
      },
    })
  })
}
