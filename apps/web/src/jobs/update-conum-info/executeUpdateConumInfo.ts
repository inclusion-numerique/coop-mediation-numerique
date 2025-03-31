import { output } from '@app/cli/output'
import { MiseEnRelationWithStructureAdministrativeInfo } from '@app/web/app/inscription/importFromConseillerNumerique/importFromConseillerNumerique.queries'
import { conseillerNumeriqueMongoCollection } from '@app/web/external-apis/conseiller-numerique/conseillerNumeriqueMongoClient'
import { prismaClient } from '@app/web/prismaClient'
import { ObjectId } from 'mongodb'

export const executeUpdateConumInfo = async () => {
  output('Starting update conseillers numériques structure referents...')

  const users = await prismaClient.user.findMany({
    where: {
      mediateur: { conseillerNumerique: { isNot: null } },
    },
    include: {
      mediateur: {
        include: { conseillerNumerique: true },
      },
    },
  })

  output(`${users.length} conseillers numériques found`)

  // const misesEnRelationCollection =
  //   await conseillerNumeriqueMongoCollection('misesEnRelation')
  //
  // const plop = await Promise.allSettled(
  //   users.map(async (user) => {
  //     const miseEnRelation = (await misesEnRelationCollection.findOne(
  //       {
  //         'conseillerObj._id': new ObjectId(
  //           user.mediateur!.conseillerNumerique!.id,
  //         ),
  //       },
  //       {
  //         projection: {
  //           _id: 1,
  //           statut: 1,
  //           structureObj: 1,
  //           dateRecrutement: 1,
  //           dateDebutDeContrat: 1,
  //           dateFinDeContrat: 1,
  //           typeDeContrat: 1,
  //         },
  //       },
  //     )) as MiseEnRelationWithStructureAdministrativeInfo | null
  //
  //     return miseEnRelation
  //   }),
  // )
  //
  // console.log(plop)

  output('Find all mises en relation from mongo...')

  output('All updates done')
}
