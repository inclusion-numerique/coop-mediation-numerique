import { conseillerNumeriqueMongoCollection } from '@app/web/external-apis/conseiller-numerique/conseillerNumeriqueMongoClient'
import { onlyDefinedAndNotNull } from '@app/web/utils/onlyDefinedAndNotNull'
import { conseillerNumeriqueUsers } from './db/conseillerNumeriqueUsers'
import {
  miseEnRelationFromCollectionFor,
  toFulfilledValue,
} from './db/miseEnRelationFromCollectionFor'
import { updateConseillersIdPg } from './db/updateIdPg'
import { updateNonAffichageCarto } from './db/updateNonAffichageCarto'

export const updateInfo = async () => {
  const users = await conseillerNumeriqueUsers()

  const miseEnRelationFor = miseEnRelationFromCollectionFor(
    await conseillerNumeriqueMongoCollection('misesEnRelation'),
  )

  const matchingConseillers = (
    await Promise.allSettled(users.map(miseEnRelationFor))
  )
    .map(toFulfilledValue)
    .filter(onlyDefinedAndNotNull)

  await updateConseillersIdPg(users, matchingConseillers)
  await updateNonAffichageCarto(matchingConseillers)
}
