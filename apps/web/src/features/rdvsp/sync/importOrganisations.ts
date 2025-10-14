import { prismaClient } from '@app/web/prismaClient'
import {
  OAuthRdvApiCredentialsWithId,
  oAuthRdvApiGetOrganisations,
} from '@app/web/rdv-service-public/executeOAuthRdvApiCall'
import type { AppendLog } from './syncAllRdvData'
import type { SyncModelResult } from './syncLog'

const organisationHasDiff = (
  existing: {
    id: number
    name: string
    email: string | null
    phoneNumber: string | null
    verticale: string | null
  },
  organisation: {
    id: number
    name: string
    email: string | null
    phone_number: string | null
    verticale: string | null
  },
) => {
  return (
    existing.name !== organisation.name ||
    existing.email !== organisation.email ||
    existing.phoneNumber !== organisation.phone_number ||
    existing.verticale !== organisation.verticale
  )
}

export const importOrganisations = async ({
  rdvAccount,
  appendLog,
}: {
  rdvAccount: OAuthRdvApiCredentialsWithId
  appendLog: AppendLog
}): Promise<{ result: SyncModelResult; count: number }> => {
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

    let noop = 0
    let updated = 0
    let created = 0

    for (const organisation of organisations) {
      const existingOrganisation = existingOrganisations.find(
        (o) => o.organisationId === organisation.id,
      )?.organisation

      const organisationData = {
        id: organisation.id,
        name: organisation.name,
        email: organisation.email,
        phoneNumber: organisation.phone_number,
        verticale: organisation.verticale,
      }

      if (existingOrganisation) {
        // Check if there's a diff
        if (!organisationHasDiff(existingOrganisation, organisation)) {
          noop++
          continue
        }

        // Update if there's a diff
        await tx.rdvOrganisation.update({
          where: { id: organisation.id },
          data: organisationData,
        })
        updated++
      } else {
        // Create new organisation
        await tx.rdvOrganisation.create({
          data: organisationData,
        })
        created++
      }
    }

    // Return result
    return {
      deleted: accountOrganisationsToDelete.length,
      created,
      updated,
      noop,
    }
  })

  appendLog(`import organisations success`)
  appendLog(`  - noop ${result.noop} organisations`)
  appendLog(`  - created ${result.created} organisations`)
  appendLog(`  - updated ${result.updated} organisations`)
  appendLog(`  - deleted ${result.deleted} organisations`)

  return {
    result: {
      noop: result.noop,
      created: result.created,
      updated: result.updated,
      deleted: result.deleted,
    },
    count: organisations.length,
  }
}
