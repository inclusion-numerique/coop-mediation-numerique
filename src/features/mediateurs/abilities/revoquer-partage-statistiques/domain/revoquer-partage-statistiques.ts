import {
  proprietairesPossibles,
  type Rattachements,
} from '@/features/mediateurs/domain'
import { type Result, success } from '@/libraries/result'
import type { EchecDeRevoquerPartageStatistiques } from './errors'
import type { RevoquerPartageStatistiquesPorts } from './ports'
import type {
  PartagesRevoques,
  RevocationDesPartages,
} from './revocation-des-partages'

export const revoquerPartageStatistiques =
  ({ revoquerLesPartages }: RevoquerPartageStatistiquesPorts) =>
  async ({
    mediateurId,
    coordinateurId,
    maintenant,
  }: Rattachements & {
    readonly maintenant: Date
  }): Promise<Result<PartagesRevoques, EchecDeRevoquerPartageStatistiques>> => {
    const revocation: RevocationDesPartages = {
      proprietaires: proprietairesPossibles({ mediateurId, coordinateurId }),
      revoqueLe: maintenant,
    }

    if (revocation.proprietaires.length === 0)
      return success({ ...revocation, partagesRevoques: 0 })

    const { partagesRevoques } = await revoquerLesPartages(revocation)

    return success({ ...revocation, partagesRevoques })
  }
