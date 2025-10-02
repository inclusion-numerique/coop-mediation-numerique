import { prismaClient } from '@app/web/prismaClient'
import {
  OAuthRdvApiCredentialsWithId,
  oAuthRdvApiGetOrganisations,
} from '@app/web/rdv-service-public/executeOAuthRdvApiCall'
import type { AppendLog } from './syncAllRdvData'

export const importOrganisations = async ({
  rdvAccount,
  appendLog,
}: {
  rdvAccount: OAuthRdvApiCredentialsWithId
  appendLog: AppendLog
}) => {
  appendLog('import organisations')
  const { organisations } = await oAuthRdvApiGetOrganisations({
    rdvAccount,
  })

  appendLog(`found ${organisations.length} organisations from api`)

  const result = await prismaClient.$transaction(async (tx) => {
    const existingOrganisations = await tx.rdvAccountOrganisation.findMany({
      where: {
        accountId: rdvAccount.id,
      },
      include: {
        organisation: true,
      },
    })

    const accountOrganisationsToDelete = existingOrganisations.filter(
      (organisation) =>
        !organisations.some((o) => o.id === organisation.organisationId),
    )

    await tx.rdvAccountOrganisation.deleteMany({
      where: {
        accountId: rdvAccount.id,
        organisationId: {
          in: accountOrganisationsToDelete.map((o) => o.organisationId),
        },
      },
    })

    const organisationsToUpsert = organisations.map((organisation) => ({
      id: organisation.id,
      name: organisation.name,
      email: organisation.email,
      phoneNumber: organisation.phone_number,
      verticale: organisation.verticale,
    }))

    for (const organisation of organisationsToUpsert) {
      await tx.rdvOrganisation.upsert({
        where: { id: organisation.id },
        create: organisation,
        update: organisation,
      })
    }

    const accountOrganisationsToCreate = organisations.filter(
      (organisation) =>
        !existingOrganisations.some(
          (o) => o.organisationId === organisation.id,
        ),
    )

    await tx.rdvAccountOrganisation.createMany({
      data: accountOrganisationsToCreate.map((organisation) => ({
        accountId: rdvAccount.id,
        organisationId: organisation.id,
      })),
    })

    // Return result
    return {
      deleted: accountOrganisationsToDelete.map((o) => o.organisationId),
      created: accountOrganisationsToCreate.map((o) => o.id),
      upsertedOrganisations: organisationsToUpsert.map((o) => o.id),
    }
  })

  appendLog(`import organisations success`)
  appendLog(`  - deleted ${result.deleted.length} organisations`)
  appendLog(`  - created ${result.created.length} organisations`)
  appendLog(`  - upserted ${result.upsertedOrganisations.length} organisations`)

  return result
}
