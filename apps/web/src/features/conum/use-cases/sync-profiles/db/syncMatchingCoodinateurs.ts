import { ConseillerNumeriqueV1Document } from '@app/web/external-apis/conseiller-numerique/ConseillerNumeriqueV1Document'
import { prismaClient } from '@app/web/prismaClient'
import { WithId } from 'mongodb'

export const syncMatchingCoodinateurs =
  (
    mongoConseillerByEmail: Map<
      string | null | undefined,
      WithId<ConseillerNumeriqueV1Document>
    >,
  ) =>
  async (coordinateurs: { id: string; user: { email: string } }[]) => {
    return Promise.all(
      coordinateurs.map(async (coordinateur) => {
        const mongoCoordinateur = mongoConseillerByEmail.get(
          coordinateur.user.email,
        )

        if (mongoCoordinateur == null) return

        return prismaClient.coordinateur.update({
          where: { id: coordinateur.id },
          data: {
            conseillerNumeriqueId: mongoCoordinateur._id.toString(),
            conseillerNumeriqueIdPg: mongoCoordinateur.idPG,
          },
        })
      }),
    )
  }
