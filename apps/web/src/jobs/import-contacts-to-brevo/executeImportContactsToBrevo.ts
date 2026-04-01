import { output } from '@app/cli/output'
import {
  createBrevoContact,
  onlyWithBrevoRole,
  toBrevoContact,
} from '@app/web/external-apis/brevo/createBrevoContact'
import { removeBrevoContactFromList } from '@app/web/external-apis/brevo/removeBrevoContactFromList'
import { PrismaClient } from '@prisma/client'

const userListId = Number.parseInt(process.env.BREVO_USERS_LIST_ID!, 10)
const prisma = new PrismaClient()

export const executeImportContactsToBrevo = async () => {
  output('Starting sync of contacts to Brevo...')

  const users = await prisma.user.findMany({
    where: { role: 'User', inscriptionValidee: { not: null }, deleted: null },
    include: {
      mediateur: true,
      coordinateur: true,
    },
  })

  const allContacts = users.map((user) => ({
    user,
    contact: toBrevoContact(user),
  }))

  const contactsWithRole = allContacts.filter(({ contact }) =>
    onlyWithBrevoRole(contact),
  )
  const contactsWithoutRole = allContacts.filter(
    ({ contact }) => !onlyWithBrevoRole(contact),
  )

  output(`${contactsWithRole.length} contacts with roles to sync`)
  output(`${contactsWithoutRole.length} contacts without roles to remove`)

  output('Syncing contacts with roles to Brevo...')

  const updateResults = await Promise.allSettled(
    contactsWithRole.map(({ contact }) =>
      createBrevoContact({ contact, listIds: [userListId] }),
    ),
  )

  const updateFailures = updateResults.filter(
    (result) => result.status === 'rejected',
  )

  if (updateFailures.length > 0) {
    output(`Sync completed with ${updateFailures.length} errors`)
  } else {
    output(`Successfully synced ${contactsWithRole.length} contacts`)
  }

  if (contactsWithoutRole.length > 0) {
    output('Removing contacts without roles from list...')

    let removedCount = 0
    let removeErrors = 0

    for (const { user } of contactsWithoutRole) {
      try {
        await removeBrevoContactFromList(user.email, userListId)
        removedCount++
        if (removedCount % 50 === 0) {
          output(`Removed ${removedCount}/${contactsWithoutRole.length}...`)
        }
      } catch {
        removeErrors++
      }
    }

    output(
      `Removed ${removedCount} contacts from list (${removeErrors} errors)`,
    )
  }

  return {
    totalUsers: users.length,
    synced: contactsWithRole.length - updateFailures.length,
    syncErrors: updateFailures.length,
    removedFromList: contactsWithoutRole.length,
  }
}
