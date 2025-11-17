import { prismaClient } from '@app/web/prismaClient'
import {
  OAuthRdvApiCredentialsWithId,
  oAuthRdvApiGetOrganisations,
} from '@app/web/rdv-service-public/executeOAuthRdvApiCall'
import { isDefinedAndNotNull } from '@app/web/utils/isDefinedAndNotNull'
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
    const organisationIds = organisations.map((o) => o.id)

    // Fetch all organisations with these IDs, including their account links
    const existingOrganisations = await tx.rdvOrganisation.findMany({
      where: {
        id: { in: organisationIds },
      },
      include: {
        accounts: {
          where: {
            accountId: rdvAccount.id,
          },
        },
      },
    })

    // STEP 1: Create or update all RdvOrganisation records first
    let noop = 0
    let updated = 0
    let created = 0

    for (const organisation of organisations) {
      const existingOrganisation = existingOrganisations.find(
        (o) => o.id === organisation.id,
      )

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

    // STEP 2: Now handle the account-organisation links
    // Get currently linked organisations for this account
    const existingOrganisationsForAccount = existingOrganisations
      .map((o) => o.accounts.find((a) => a.accountId === rdvAccount.id))
      .filter(isDefinedAndNotNull)

    // Delete links that should no longer exist
    const accountOrganisationsToDelete = existingOrganisationsForAccount.filter(
      (o) => !existingOrganisations.map((o) => o.id).includes(o.organisationId),
    )

    await tx.rdvAccountOrganisation.deleteMany({
      where: {
        accountId: rdvAccount.id,
        organisationId: {
          in: accountOrganisationsToDelete.map(
            ({ organisationId }) => organisationId,
          ),
        },
      },
    })

    updated += accountOrganisationsToDelete.length

    // Create new links
    const currentlyLinkedIds = existingOrganisationsForAccount.map(
      ({ organisationId }) => organisationId,
    )
    const accountOrganisationsToCreate = organisations.filter(
      (organisation) => !currentlyLinkedIds.includes(organisation.id),
    )

    await tx.rdvAccountOrganisation.createMany({
      data: accountOrganisationsToCreate.map((organisation) => ({
        accountId: rdvAccount.id,
        organisationId: organisation.id,
      })),
    })

    updated += accountOrganisationsToCreate.length

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
