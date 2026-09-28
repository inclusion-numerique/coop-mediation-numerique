import { type Failure, type Result, success } from '@app/web/libraries/result'
import type { ErreurRdvApi } from '../../../domain/errors'
import type { OrganisationId } from '../../../domain/organisation-id'
import type { RdvSynchronise } from '../../../domain/rdv'

export type LectureOrganisation = {
  readonly organisationId: OrganisationId
  readonly resultat: Result<readonly RdvSynchronise[], ErreurRdvApi>
}

export type RdvsLus = {
  readonly rdvs: readonly RdvSynchronise[]
  readonly organisationIdsInaccessibles: readonly OrganisationId[]
}

const estAccesRefuse = (resultat: LectureOrganisation['resultat']): boolean =>
  !resultat.success && resultat.error._tag === 'AccesRefuse'

export const rassemblerLectures = (
  lectures: readonly LectureOrganisation[],
): Result<RdvsLus, ErreurRdvApi> => {
  const echecBloquant = lectures
    .map(({ resultat }) => resultat)
    .find(
      (resultat): resultat is Failure<ErreurRdvApi> =>
        !resultat.success && !estAccesRefuse(resultat),
    )

  if (echecBloquant !== undefined) {
    return echecBloquant
  }

  return success({
    rdvs: lectures.flatMap(({ resultat }) =>
      resultat.success ? resultat.data : [],
    ),
    organisationIdsInaccessibles: lectures
      .filter(({ resultat }) => estAccesRefuse(resultat))
      .map(({ organisationId }) => organisationId),
  })
}
