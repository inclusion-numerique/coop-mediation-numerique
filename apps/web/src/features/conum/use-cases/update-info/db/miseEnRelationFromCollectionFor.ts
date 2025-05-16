import { Document, ObjectId } from 'mongodb'

export const miseEnRelationFromCollectionFor =
  (misesEnRelationCollection: Document) =>
  async (user: {
    mediateur: {
      conseillerNumerique: { id: string } | null
    } | null
  }) =>
    (await misesEnRelationCollection.findOne({
      'conseillerObj._id': new ObjectId(
        user.mediateur?.conseillerNumerique?.id,
      ),
    })) as unknown as {
      value: {
        conseillerObj: {
          _id: ObjectId
          idPG: number
          nonAffichageCarto: boolean
        }
      }
    }

export const toFulfilledValue = <T>(result: PromiseSettledResult<T>) =>
  result.status === 'fulfilled' ? result.value : undefined
