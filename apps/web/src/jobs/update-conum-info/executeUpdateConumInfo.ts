import { output } from '@app/cli/output'
import { conseillerNumeriqueMongoCollection } from '@app/web/external-apis/conseiller-numerique/conseillerNumeriqueMongoClient'
import { conseillerNumeriqueUsers } from '@app/web/features/conum/use-cases/update-info/db/conseillerNumeriqueUsers'
import {
  miseEnRelationFromCollectionFor,
  toFulfilledValue,
} from '@app/web/features/conum/use-cases/update-info/db/miseEnRelationFromCollectionFor'
import { updateConseillersIdPg } from '@app/web/features/conum/use-cases/update-info/db/updateIdPg'
import { onlyDefinedAndNotNull } from '@app/web/utils/onlyDefinedAndNotNull'

export const executeUpdateConumInfo = async () => {
  output('Starting update conseillers numériques structure referents...')

  const users = await conseillerNumeriqueUsers()

  const miseEnRelationFor = miseEnRelationFromCollectionFor(
    await conseillerNumeriqueMongoCollection('misesEnRelation'),
  )

  output(`${users.length} conseillers numériques found`)

  const matchingConseillers = (
    await Promise.allSettled(users.map(miseEnRelationFor))
  )
    .map(toFulfilledValue)
    .filter(onlyDefinedAndNotNull)

  const usersWithoutIdPg = await updateConseillersIdPg(
    users,
    matchingConseillers,
  )

  output(`Updated ${usersWithoutIdPg.length} conseillers numériques with idPg`)

  output('All updates done')
}
