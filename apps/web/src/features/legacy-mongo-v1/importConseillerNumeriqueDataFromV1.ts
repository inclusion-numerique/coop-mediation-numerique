import { sessionUserSelect } from '@app/web/auth/getSessionUserFromSessionToken'
import { SessionUser } from '@app/web/auth/sessionUser'
import type { ConseillerNumeriqueV1Data } from '@app/web/external-apis/conseiller-numerique/ConseillerNumeriqueV1Data'
import {
  findCoordinateursFor,
  upsertCoordinationsForMediateur,
} from '@app/web/features/legacy-mongo-v1/importFromConseillerNumerique.queries'
import { importLieuxActivitesFromV1Data } from '@app/web/features/legacy-mongo-v1/importLieuxActivitesFromV1Data'
import { importStructureEmployeuseFromV1Data } from '@app/web/features/legacy-mongo-v1/importStructureEmployeuseFromV1Data'
import { prismaClient } from '@app/web/prismaClient'
import type { Prisma } from '@prisma/client'

export const importConseillerNumeriqueDataFromV1 = async ({
  user,
  v1Conseiller,
  allowMissingMiseEnRelation = false,
}: {
  user: Pick<SessionUser, 'id'>
  v1Conseiller: ConseillerNumeriqueV1Data
  allowMissingMiseEnRelation?: boolean
}) => {
  // 1. Create the mediateur and conseiller numerique objects
  const upsertedMediateur = await prismaClient.mediateur.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
    },
    update: {},
  })

  const conseillerData = {
    id: v1Conseiller.conseiller.id,
    idPg: v1Conseiller.conseiller.idPG,
    mediateurId: upsertedMediateur.id,
  } satisfies Prisma.ConseillerNumeriqueUncheckedCreateInput

  const existingConseiller = await prismaClient.conseillerNumerique.findFirst({
    where: {
      OR: [
        { id: conseillerData.id },
        { idPg: conseillerData.idPg },
        { mediateurId: conseillerData.mediateurId },
      ],
    },
  })

  // If existing conseiller, we do nothing as to not change v2 conseiller ids from one user to another
  if (!existingConseiller) {
    await prismaClient.conseillerNumerique
      .create({
        data: conseillerData,
        select: {
          id: true,
          idPg: true,
          mediateurId: true,
        },
      })
      .catch((error) => {
        // biome-ignore lint/suspicious/noConsole: need this for cli scripts debug
        console.error('Could not create conseiller numerique', {
          id: v1Conseiller.conseiller.id,
          idPg: v1Conseiller.conseiller.idPG,
          error,
        })

        throw error
      })
  }

  // 2. Associate the coordinateurs to the conseiller
  const coordinateurs = await findCoordinateursFor(v1Conseiller)

  await upsertCoordinationsForMediateur({
    mediateurId: upsertedMediateur.id,
    coordinateurIds: coordinateurs.map(({ id }) => id),
  })

  // 3. Import or link to structure employeuse
  if (!allowMissingMiseEnRelation && !v1Conseiller.miseEnRelationActive) {
    throw new Error('Mise en relation active is required')
  }

  if (v1Conseiller.miseEnRelationActive) {
    await importStructureEmployeuseFromV1Data({
      user,
      conseillerNumeriqueV1: {
        ...v1Conseiller,
        miseEnRelationActive: v1Conseiller.miseEnRelationActive, // typescript does not track that it is defined
      },
    })
  }

  // 4. Import or link to lieux activité
  const lieuxActivites = await importLieuxActivitesFromV1Data({
    mediateurId: upsertedMediateur.id,
    conseillerV1Data: v1Conseiller,
  })

  // 5. Update lifecycle data in user
  const userWithImportedData = await prismaClient.user.update({
    where: { id: user.id },
    data: {
      donneesConseillerNumeriqueV1Importees: new Date(),
      structureEmployeuseRenseignee: new Date(),
      lieuxActiviteRenseignes:
        lieuxActivites.length > 0 ? new Date() : undefined,
    },
    select: sessionUserSelect,
  })

  return userWithImportedData
}
