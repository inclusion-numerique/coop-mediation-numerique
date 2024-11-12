import type { Prisma } from '@prisma/client'
import { SessionUser } from '@app/web/auth/sessionUser'
import { ConseillerNumeriqueV1DataWithActiveMiseEnRelation } from '@app/web/external-apis/conseiller-numerique/isConseillerNumeriqueV1WithActiveMiseEnRelation'
import { prismaClient } from '@app/web/prismaClient'
import {
  findCoordinateursFor,
  upsertCoordinationsForMediateur,
} from '@app/web/app/inscription/importFromConseillerNumerique/importFromConseillerNumerique.queries'
import { importStructureEmployeuseFromV1Data } from '@app/web/app/inscription/(steps)/identification/importStructureEmployeuseFromV1Data'
import { sessionUserSelect } from '@app/web/auth/getSessionUserFromSessionToken'
import { importLieuxActivitesFromV1Data } from '@app/web/app/inscription/(steps)/identification/importLieuxActivitesFromV1Data'

export const importConseillerNumeriqueDataFromV1 = async ({
  user,
  v1Conseiller,
}: {
  user: Pick<SessionUser, 'id'>
  v1Conseiller: ConseillerNumeriqueV1DataWithActiveMiseEnRelation
}) => {
  // 1. Create the mediateur and conseiller numerique objects
  const data = {
    id: v1Conseiller.conseiller.id,
    idPg: v1Conseiller.conseiller.idPG,
    mediateur: {
      connectOrCreate: {
        where: { userId: user.id },
        create: { userId: user.id },
      },
    },
  } satisfies Prisma.ConseillerNumeriqueCreateInput

  const upsertedConseillerNumerique =
    await prismaClient.conseillerNumerique.upsert({
      where: { id: v1Conseiller.conseiller.id },
      create: data,
      update: data,
      select: {
        id: true,
        idPg: true,
        mediateurId: true,
      },
    })

  // 2. Associate the coordinateurs to the conseiller
  const coordinateurs = await findCoordinateursFor(v1Conseiller)

  await upsertCoordinationsForMediateur({
    mediateurId: upsertedConseillerNumerique.id,
    coordinateurIds: coordinateurs.map(({ id }) => id),
  })

  // 3. Import or link to structure employeuse
  await importStructureEmployeuseFromV1Data({
    user,
    conseillerNumeriqueV1: v1Conseiller,
  })

  // 4. Import or link to lieux activité

  const lieuxActivites = await importLieuxActivitesFromV1Data({
    mediateurId: upsertedConseillerNumerique.mediateurId,
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