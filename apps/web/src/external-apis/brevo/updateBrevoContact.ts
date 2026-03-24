import { prismaClient } from '@app/web/prismaClient'
import { ServerWebAppConfig } from '@app/web/ServerWebAppConfig'
import {
  createBrevoContact,
  deploymentCanCreateBrevoContact,
  onlyWithBrevoRole,
  toBrevoContact,
} from './createBrevoContact'
import { removeBrevoContactFromList } from './removeBrevoContactFromList'

export const updateBrevoContact = async (userId: string): Promise<boolean> => {
  if (!deploymentCanCreateBrevoContact()) {
    return false
  }

  const user = await prismaClient.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      isConseillerNumerique: true,
      mediateur: { select: { id: true } },
      coordinateur: { select: { id: true } },
    },
  })

  if (!user) return false

  const contact = toBrevoContact(user)

  if (!onlyWithBrevoRole(contact)) {
    await removeBrevoContactFromList(
      user.email,
      ServerWebAppConfig.Brevo.usersListId,
    )
    return true
  }

  await createBrevoContact({
    contact,
    listIds: [ServerWebAppConfig.Brevo.usersListId],
  })

  return true
}
