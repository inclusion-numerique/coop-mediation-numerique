import { MiseEnRelationWithStructureAdministrativeInfo } from '@app/web/app/inscription/importFromConseillerNumerique/importFromConseillerNumerique.queries'
import { MiseEnRelationV1MinimalProjection } from '@app/web/external-apis/conseiller-numerique/MiseEnRelationConseillerNumeriqueV1'
import { Document, ObjectId } from 'mongodb'

export const miseEnRelationFromCollectionFor =
  (misesEnRelationCollection: Document) =>
  async (user: {
    mediateur: {
      conseillerNumerique: { id: string } | null
    } | null
  }) =>
    (await misesEnRelationCollection.findOne(
      {
        'conseillerObj._id': new ObjectId(
          user.mediateur?.conseillerNumerique?.id,
        ),
      },
      { projection: MiseEnRelationV1MinimalProjection },
    )) as MiseEnRelationWithStructureAdministrativeInfo | null
