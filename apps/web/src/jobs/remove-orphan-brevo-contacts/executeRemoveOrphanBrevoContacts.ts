import { output } from '@app/cli/output'
import {
  brevoApiThrottle,
  deploymentCanCreateBrevoContact,
} from '@app/web/external-apis/brevo/createBrevoContact'
import { deleteBrevoContact } from '@app/web/external-apis/brevo/deleteBrevoContact'
import { deleteBrevoContactIfOrphan } from '@app/web/external-apis/brevo/deleteBrevoContactIfOrphan'
import { removeBrevoContactFromList } from '@app/web/external-apis/brevo/removeBrevoContactFromList'
import { prismaClient } from '@app/web/prismaClient'
import { ServerWebAppConfig } from '@app/web/ServerWebAppConfig'
import axios from 'axios'

const isAnonymizedEmail = (email: string): boolean =>
  email.startsWith('deleted+') && email.includes('@')

type BrevoContactsResponse = {
  contacts: {
    id: number
    email: string
    ext_id?: string
    attributes: Record<string, unknown>
  }[]
  count: number
}

const fetchBrevoContactsPage = brevoApiThrottle(
  async (listId: number, offset: number, limit: number) => {
    console.info(`Fetching Brevo contacts page: listId=${listId}, offset=${offset}, limit=${limit}`)
    const response = await axios.get<BrevoContactsResponse>(
      'https://api.brevo.com/v3/contacts',
      {
        headers: {
          'api-key': ServerWebAppConfig.Brevo.apiKey,
        },
        params: {
          listId,
          offset,
          limit,
          sort: 'asc',
        },
      },
    )
    return response.data
  },
)

const getAllBrevoContacts = async (
  listId: number,
): Promise<BrevoContactsResponse['contacts']> => {
  const allContacts: BrevoContactsResponse['contacts'] = []
  const limit = 500
  let offset = 0
  let hasMore = true

  while (hasMore) {
    const page = await fetchBrevoContactsPage(listId, offset, limit)
    allContacts.push(...page.contacts)
    offset += limit
    hasMore = page.contacts.length === limit
    output(`Fetched ${allContacts.length} contacts from Brevo...`)
  }

  return allContacts
}

export const executeRemoveOrphanBrevoContacts = async () => {
  if (!deploymentCanCreateBrevoContact()) {
    output('Skipping reconciliation - not on main deployment')
    return { skipped: true }
  }

  output('Starting Brevo contacts reconciliation...')

  const listId = ServerWebAppConfig.Brevo.usersListId
  const brevoContacts = await getAllBrevoContacts(listId)

  output(`Found ${brevoContacts.length} contacts in Brevo`)

  const anonymizedContacts = brevoContacts.filter((c) =>
    isAnonymizedEmail(c.email),
  )
  output(
    `Found ${anonymizedContacts.length} anonymized contacts to delete permanently`,
  )

  let anonymizedDeletedCount = 0
  let anonymizedErrorCount = 0

  for (const { email } of anonymizedContacts) {
    try {
      await deleteBrevoContact(email)
      anonymizedDeletedCount++
      if (anonymizedDeletedCount % 10 === 0) {
        output(
          `Deleted ${anonymizedDeletedCount}/${anonymizedContacts.length} anonymized contacts...`,
        )
      }
    } catch {
      anonymizedErrorCount++
    }
  }

  output(
    `Anonymized contacts cleanup: ${anonymizedDeletedCount} deleted, ${anonymizedErrorCount} errors`,
  )

  const nonAnonymizedContacts = brevoContacts.filter(
    (c) => !isAnonymizedEmail(c.email),
  )

  const contactsByExtId = new Map<string, string>()
  for (const contact of nonAnonymizedContacts) {
    const extId = contact.attributes.EXT_ID
    if (typeof extId === 'string') {
      contactsByExtId.set(extId, contact.email)
    }
  }

  const brevoExtIds = [...contactsByExtId.keys()]
  output(`Found ${brevoExtIds.length} non-anonymized contacts with ext_id`)

  const existingUsers = await prismaClient.user.findMany({
    where: {
      id: { in: brevoExtIds },
      deleted: null,
      inscriptionValidee: { not: null },
    },
    select: { id: true },
  })

  const existingUserIds = new Set(existingUsers.map((u) => u.id))

  const orphanContacts = brevoExtIds
    .filter((id) => !existingUserIds.has(id))
    .map((extId) => ({ extId, email: contactsByExtId.get(extId)! }))

  output(`Found ${orphanContacts.length} orphan contacts to remove from list`)
  for (const { email } of orphanContacts) {
    output(`  - ${email}`)
  }

  let removedCount = 0
  let deletedCount = 0
  let errorCount = 0

  for (const { email } of orphanContacts) {
    try {
      await removeBrevoContactFromList(email, listId)
      removedCount++

      const wasDeleted = await deleteBrevoContactIfOrphan(email)
      if (wasDeleted) deletedCount++
      if (removedCount % 10 === 0) {
        output(
          `Processed ${removedCount}/${orphanContacts.length} orphan contacts`,
        )
      }
    } catch (error) {
      output(`Error processing ${email}: ${error}`)
      errorCount++
    }
  }

  output(
    `Reconciliation complete: ${removedCount} removed from list, ${deletedCount} deleted from Brevo, ${errorCount} errors`,
  )

  return {
    totalContacts: brevoContacts.length,
    anonymizedDeleted: anonymizedDeletedCount,
    anonymizedErrors: anonymizedErrorCount,
    removedFromList: removedCount,
    deletedFromBrevo: deletedCount,
    errors: errorCount,
  }
}
