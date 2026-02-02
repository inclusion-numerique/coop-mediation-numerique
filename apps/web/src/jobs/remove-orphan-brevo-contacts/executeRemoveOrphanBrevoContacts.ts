import { output } from '@app/cli/output'
import {
  brevoApiThrottle,
  deploymentCanCreateBrevoContact,
} from '@app/web/external-apis/brevo/createBrevoContact'
import { deleteBrevoContact } from '@app/web/external-apis/brevo/deleteBrevoContact'
import { prismaClient } from '@app/web/prismaClient'
import { ServerWebAppConfig } from '@app/web/ServerWebAppConfig'
import axios from 'axios'

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

  const contactsByExtId = new Map<string, string>()
  for (const contact of brevoContacts) {
    const extId = contact.attributes.EXT_ID
    if (typeof extId === 'string') {
      contactsByExtId.set(extId, contact.email)
    }
  }

  const brevoExtIds = [...contactsByExtId.keys()]
  output(`Found ${brevoExtIds.length} contacts with ext_id`)

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

  output(`Found ${orphanContacts.length} orphan contacts to delete`)

  if (orphanContacts.length === 0) {
    output('No orphan contacts to delete')
    return {
      totalContacts: brevoContacts.length,
      orphansDeleted: 0,
      errors: 0,
    }
  }

  let deletedCount = 0
  let errorCount = 0

  for (const { email } of orphanContacts) {
    try {
      await deleteBrevoContact(email)
      deletedCount++
      if (deletedCount % 10 === 0) {
        output(
          `Deleted ${deletedCount}/${orphanContacts.length} orphan contacts`,
        )
      }
    } catch {
      errorCount++
    }
  }

  output(
    `Reconciliation complete: ${deletedCount} deleted, ${errorCount} errors`,
  )

  return {
    totalContacts: brevoContacts.length,
    orphansDeleted: deletedCount,
    errors: errorCount,
  }
}
