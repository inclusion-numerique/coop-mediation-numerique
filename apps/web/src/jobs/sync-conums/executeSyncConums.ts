import { output } from '@app/cli/output'
import { conseillerNumeriqueMongoCollection } from '@app/web/external-apis/conseiller-numerique/conseillerNumeriqueMongoClient'
import { prismaClient } from '@app/web/prismaClient'
import { chunk } from 'lodash-es'
import { SyncConumsJob } from './syncConumsJob'

export const executeSyncConums = async (_job: SyncConumsJob) => {
  output('Syncing conseillers numériques...')

  const conseillerCollection =
    await conseillerNumeriqueMongoCollection('conseillers')
  const conseillersMongo = await conseillerCollection.find().toArray()

  const emails = conseillersMongo.map((conseiller) => conseiller.emailPro)
  const mongoConseillerByEmail = new Map(
    conseillersMongo.map((conseiller) => [conseiller.emailPro, conseiller]),
  )

  const batchSize = 500
  const chunks = chunk(emails, batchSize)

  const users = (
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

  const mediateurs = await prismaClient.mediateur.findMany({
    where: {
      userId: { in: users.map((user) => user.id) },
      conseillerNumerique: null,
    },
    select: {
      id: true,
      user: true,
    },
  })

  output(`Found ${mediateurs.length} not referenced conseillers numériques`)

  const coordinateurs = await prismaClient.coordinateur.findMany({
    where: {
      userId: { in: users.map((user) => user.id) },
      OR: [{ conseillerNumeriqueId: null }, { conseillerNumeriqueId: '' }],
    },
    select: {
      id: true,
      user: true,
    },
  })

  output(
    `Found ${coordinateurs.length} not referenced coordinateurs de conseillers numériques`,
  )

  await Promise.all(
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

  await Promise.all(
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

  output('Successfully synced conseillers numériques')
}
