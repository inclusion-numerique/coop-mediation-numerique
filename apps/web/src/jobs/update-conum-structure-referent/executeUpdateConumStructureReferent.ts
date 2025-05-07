import { output } from '@app/cli/output'
import { conseillerNumeriqueMongoCollection } from '@app/web/external-apis/conseiller-numerique/conseillerNumeriqueMongoClient'
import { miseEnRelationFromCollectionFor } from '@app/web/features/conum/use-cases/update-structure-referent/db/miseEnRelationFromCollectionFor'
import { usersWithoutStructureReferent } from '@app/web/features/conum/use-cases/update-structure-referent/db/usersWithoutStructureReferent'
import { miseAJourStructureEmployeuseFor } from '@app/web/features/conum/use-cases/update-structure-referent/miseAJourStructureEmployeuseFor'

export const executeUpdateConumStructureReferent = async () => {
  output('Starting update conseillers numériques structure referents...')

  const users = await usersWithoutStructureReferent()

  output(`${users.length} conseillers numériques found`)

  const miseEnRelationFor = miseEnRelationFromCollectionFor(
    await conseillerNumeriqueMongoCollection('misesEnRelation'),
  )

  output('Find all mises en relation from mongo...')

  await Promise.allSettled(
    users.map(async (user) => {
      const miseEnRelation = await miseEnRelationFor(user)
      if (miseEnRelation != null) {
        return miseAJourStructureEmployeuseFor(user.id)(miseEnRelation)
      }
    }),
  )

  output('All updates done')
}
