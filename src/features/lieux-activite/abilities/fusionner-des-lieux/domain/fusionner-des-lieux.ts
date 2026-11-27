import { failure, type Result, success } from '@/libraries/result'
import { LieuIntrouvable } from '../../../domain/errors'
import type { LieuId } from '../../../domain/identifiants/lieu-id'
import type { MediateurId } from '../../../domain/identifiants/mediateur-id'
import { FicheComplete } from '../../../domain/registre/ecriture-au-registre'
import type { EchecDeFusionnerDesLieux } from './errors'
import type { FicheFusionnable } from './fiche-fusionnable'
import { ficheFusionnee } from './fiche-fusionnee'
import type { FusionDeLieux } from './fusion-de-lieux'
import type { FusionnerDesLieuxPorts } from './ports'

const ficheDe = (
  fiches: readonly FicheFusionnable[],
  id: LieuId,
): FicheFusionnable | undefined => fiches.find(({ lieu }) => lieu.id === id)

const mediateursATransferer = ({
  rattachesALaSource,
  enActiviteDansLaCible,
}: {
  readonly rattachesALaSource: readonly MediateurId[]
  readonly enActiviteDansLaCible: readonly MediateurId[]
}): readonly MediateurId[] => [
  ...new Set(
    rattachesALaSource.filter(
      (mediateur) => !enActiviteDansLaCible.includes(mediateur),
    ),
  ),
]

export const fusionnerDesLieux =
  ({
    fichesAFusionner,
    mediateursDesLieux,
    fusionner,
  }: FusionnerDesLieuxPorts) =>
  async ({
    source,
    cible,
    maintenant,
  }: {
    readonly source: LieuId
    readonly cible: LieuId
    readonly maintenant: Date
  }): Promise<Result<FusionDeLieux, EchecDeFusionnerDesLieux>> => {
    const fiches = await fichesAFusionner([source, cible])
    const deLaSource = ficheDe(fiches, source)

    if (deLaSource === undefined) return failure(LieuIntrouvable(source))

    const deLaCible = ficheDe(fiches, cible)

    if (deLaCible === undefined) return failure(LieuIntrouvable(cible))

    const fusion: FusionDeLieux = {
      source,
      cible,
      fusionneLe: maintenant,
      fiche: ficheFusionnee(deLaSource, deLaCible),
      mediateursATransferer: mediateursATransferer(
        await mediateursDesLieux({ source, cible }),
      ),
      ecritureAuRegistre: FicheComplete,
    }
    const issue = await fusionner(fusion)

    return issue._tag === 'LieuDisparu'
      ? failure(LieuIntrouvable(issue.lieuId))
      : success(fusion)
  }
