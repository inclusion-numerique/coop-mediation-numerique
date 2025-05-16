import { ConseillerNumeriqueV1Document } from '@app/web/external-apis/conseiller-numerique/ConseillerNumeriqueV1Document'
import { prismaClient } from '@app/web/prismaClient'
import { chunk } from 'lodash-es'
import { WithId } from 'mongodb'

export const usersMatchingconumsEmailPro = async (
  mongoConseillerByEmail: Map<
    string | null | undefined,
    WithId<ConseillerNumeriqueV1Document>
  >,
) => {
  const batchSize = 500
  const chunks = chunk(Array.from(mongoConseillerByEmail.keys()), batchSize)

  return (
    await Promise.all(
      chunks.map((chunk) =>
        prismaClient.user.findMany({
          where: {
            email: {
              in: chunk.filter((email): email is string => email != null),
            },
          },
          select: {
            id: true,
            email: true,
          },
        }),
      ),
    )
  ).flat()
}
