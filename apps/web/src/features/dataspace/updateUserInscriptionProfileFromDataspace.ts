import {
  PrismaSessionUser,
  sessionUserSelect,
} from '@app/web/auth/getSessionUserFromSessionToken'
import type { DataspaceMediateur } from '@app/web/external-apis/dataspace/dataSpaceApiClient'
import { getProfileFromDataspace } from '@app/web/features/dataspace/getProfileFromDataspace'
import { prismaClient } from '@app/web/prismaClient'
import type { ProfilInscription } from '@prisma/client'

/**
 * Update user's checked profile inscription based on Dataspace data
 *
 * This is the Dataspace equivalent of updateUserInscriptionProfileFromV1Data
 */
export const updateUserInscriptionProfileFromDataspace = async ({
  user,
  dataspaceData,
}: {
  user: { id: string }
  dataspaceData: DataspaceMediateur | null
}): Promise<
  PrismaSessionUser & { checkedProfilInscription: ProfilInscription }
> =>
  prismaClient.user
    .update({
      where: { id: user.id },
      data: {
        checkedProfilInscription: getProfileFromDataspace({
          dataspaceData,
        }),
      },
      select: sessionUserSelect,
    })
    .then((updatedUser) => {
      if (!updatedUser.checkedProfilInscription) {
        throw new Error('Could not update user profile')
      }
      return updatedUser as PrismaSessionUser & {
        checkedProfilInscription: ProfilInscription
      }
    })
