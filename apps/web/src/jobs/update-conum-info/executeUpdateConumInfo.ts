import { output } from '@app/cli/output'
import { MiseEnRelationWithStructureAdministrativeInfo } from '@app/web/app/inscription/importFromConseillerNumerique/importFromConseillerNumerique.queries'
import { conseillerNumeriqueMongoCollection } from '@app/web/external-apis/conseiller-numerique/conseillerNumeriqueMongoClient'
import { prismaClient } from '@app/web/prismaClient'
import { ObjectId } from 'mongodb'

const withoutIdPg = ({
  mediateur,
}: {
  mediateur: {
    conseillerNumerique: { idPg: number | null } | null
  } | null
}) => mediateur?.conseillerNumerique?.idPg == null

export const executeUpdateConumInfo = async () => {
  output('Starting update conseillers numériques structure referents...')

  const users = await prismaClient.user.findMany({
    where: { mediateur: { conseillerNumerique: { isNot: null } } },
    include: { mediateur: { include: { conseillerNumerique: true } } },
  })

  output(`${users.length} conseillers numériques found`)

  const misesEnRelationCollection =
    await conseillerNumeriqueMongoCollection('misesEnRelation')

  const matchingConseillers = (await Promise.allSettled(
    users.map(
      async (user) =>
        (await misesEnRelationCollection.findOne({
          'conseillerObj._id': new ObjectId(
            user.mediateur?.conseillerNumerique?.id,
          ),
        })) as MiseEnRelationWithStructureAdministrativeInfo | null,
    ),
  )) as unknown as {
    value: {
      conseillerObj: {
        _id: ObjectId
        idPG: number
        nonAffichageCarto: boolean
      }
    }
  }[]

  const usersWithoutIdPg = users.filter(withoutIdPg)

  for (const user of usersWithoutIdPg) {
    if (user.mediateur == null) continue

    const match = matchingConseillers.find(
      (conseiller) =>
        conseiller.value.conseillerObj._id.toString() ===
        user.mediateur?.conseillerNumerique?.id,
    )

    if (match == null) continue

    await prismaClient.conseillerNumerique.update({
      where: { mediateurId: user.mediateur.id },
      data: { idPg: match.value.conseillerObj.idPG },
    })
  }

  output(`Updated ${usersWithoutIdPg.length} conseillers numériques with idPg`)

  const nonAffichageIds = matchingConseillers
    .filter((conseiller) => conseiller.value.conseillerObj.nonAffichageCarto)
    .map((conseiller) => conseiller.value.conseillerObj._id.toString())

  const affectedUsers = await prismaClient.mediateur.updateMany({
    where: {
      conseillerNumerique: {
        id: { notIn: nonAffichageIds },
      },
      isVisible: false,
    },
    data: { isVisible: true },
  })

  output(`Updated ${affectedUsers.count} conseillers numériques visibility`)

  output('All updates done')
}
