import { ConseillerNumeriqueV1Document } from '@app/web/external-apis/conseiller-numerique/ConseillerNumeriqueV1Document'
import { prismaClient } from '@app/web/prismaClient'
import { WithId } from 'mongodb'

export const syncMatchingConseillersNumeriques =
  (
    mongoConseillerByEmail: Map<
      string | null | undefined,
      WithId<ConseillerNumeriqueV1Document>
    >,
  ) =>
  async (mediateurs: { id: string; user: { email: string } }[]) => {
    return Promise.all(
      mediateurs.map(async (mediateur) => {
        const mongoConseiller = mongoConseillerByEmail.get(mediateur.user.email)

        if (mongoConseiller == null) return

        return prismaClient.conseillerNumerique.upsert({
          where: { id: mongoConseiller._id.toString() },
          update: {
            mediateurId: mediateur.id,
            idPg: mongoConseiller.idPG,
          },
          create: {
            id: mongoConseiller._id.toString(),
            idPg: mongoConseiller.idPG,
            mediateurId: mediateur.id,
          },
        })
      }),
    )
  }
