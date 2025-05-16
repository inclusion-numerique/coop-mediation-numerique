import { conseillerNumeriqueMongoCollection } from '@app/web/external-apis/conseiller-numerique/conseillerNumeriqueMongoClient'
import { miseEnRelationFromCollectionFor } from './db/miseEnRelationFromCollectionFor'
import { usersWithoutStructureReferent } from './db/usersWithoutStructureReferent'
import { miseAJourStructureEmployeuseFor } from './miseAJourStructureEmployeuseFor'

export const updateStructureReferent = async () => {
  const users = await usersWithoutStructureReferent()

  const miseEnRelationFor = miseEnRelationFromCollectionFor(
    await conseillerNumeriqueMongoCollection('misesEnRelation'),
  )

  await Promise.allSettled(
    users.map(async (user) => {
      const miseEnRelation = await miseEnRelationFor(user)
      if (miseEnRelation != null) {
        return miseAJourStructureEmployeuseFor(user.id)(miseEnRelation)
      }
    }),
  )
}
