import { createHash } from 'node:crypto'
import {
  deleteBrevoContact,
  deploymentCanDeleteBrevoContact,
} from '@app/web/external-apis/brevo/deleteBrevoContact'
import { prismaClient } from '@app/web/prismaClient'

export const deleteUser = async (userId: string, userEmail: string) => {
  if (deploymentCanDeleteBrevoContact()) {
    await deleteBrevoContact(userEmail)
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
