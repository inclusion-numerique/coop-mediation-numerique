import { createHash } from 'node:crypto'
import { deleteBrevoContactIfOrphan } from '@app/web/external-apis/brevo/deleteBrevoContactIfOrphan'
import {
  deploymentCanRemoveBrevoContactFromList,
  removeBrevoContactFromList,
} from '@app/web/external-apis/brevo/removeBrevoContactFromList'
import { prismaClient } from '@app/web/prismaClient'
import { ServerWebAppConfig } from '@app/web/ServerWebAppConfig'

export const deleteUser = async (userId: string, userEmail: string) => {
  if (deploymentCanRemoveBrevoContactFromList()) {
    await removeBrevoContactFromList(
      userEmail,
      ServerWebAppConfig.Brevo.usersListId,
    )
    await deleteBrevoContactIfOrphan(userEmail)
  }

  const hash = createHash('sha256')
    .update(`${userId}-${userEmail}`)
    .digest('base64url')
    .slice(0, 12)

  await prismaClient.session.deleteMany({ where: { userId } })

  return prismaClient.user.update({
    where: { id: userId },
    data: {
      deleted: new Date(),
      email: `deleted+${hash}@coop-numerique.anct.gouv.fr`,
      firstName: 'Utilisateur',
      lastName: 'Supprimé',
      name: 'Utilisateur Supprimé',
      phone: null,
    },
  })
}
