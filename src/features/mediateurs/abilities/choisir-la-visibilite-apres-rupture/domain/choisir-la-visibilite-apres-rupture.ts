import type { AuteurId, MediateurId } from '@/features/mediateurs/domain'
import { failure, type Result, success } from '@/libraries/result'
import {
  AucuneRuptureEnAttente,
  type ChoisirLaVisibiliteApresRuptureError,
  MediateurIntrouvable,
} from './errors'
import {
  type ReponseApresRupture,
  visibiliteApres,
} from './reponse-apres-rupture'
import {
  type Contrat,
  type RuptureEnAttente,
  ruptureEnAttente,
} from './rupture-en-attente'

export type MediateurEtContrats = {
  readonly id: MediateurId
  readonly visibiliteChoisieLe: Date | null
  readonly contrats: readonly Contrat[]
}

export type LireMediateurEtContrats = (
  mediateurId: MediateurId,
) => Promise<MediateurEtContrats | null>

export type EnregistrerLeChoix = (choix: {
  readonly mediateur: MediateurEtContrats
  readonly reponse: ReponseApresRupture
  readonly visible: boolean
  readonly rupture: RuptureEnAttente
  readonly auteurId: AuteurId
  readonly maintenant: Date
}) => Promise<{ readonly enregistre: boolean }>

export const choisirLaVisibiliteApresRupture =
  ({
    lireMediateurEtContrats,
    enregistrer,
  }: {
    readonly lireMediateurEtContrats: LireMediateurEtContrats
    readonly enregistrer: EnregistrerLeChoix
  }) =>
  async ({
    mediateurId,
    reponse,
    auteurId,
    maintenant,
  }: {
    readonly mediateurId: MediateurId
    readonly reponse: ReponseApresRupture
    readonly auteurId: AuteurId
    readonly maintenant: Date
  }): Promise<Result<void, ChoisirLaVisibiliteApresRuptureError>> => {
    const mediateur = await lireMediateurEtContrats(mediateurId)

    if (mediateur === null) return failure(MediateurIntrouvable(mediateurId))

    const rupture = ruptureEnAttente({
      contrats: mediateur.contrats,
      visibiliteChoisieLe: mediateur.visibiliteChoisieLe,
      maintenant,
    })

    if (rupture === null) return failure(AucuneRuptureEnAttente(mediateurId))

    const { enregistre } = await enregistrer({
      mediateur,
      reponse,
      visible: visibiliteApres(reponse),
      rupture,
      auteurId,
      maintenant,
    })

    return enregistre
      ? success(undefined)
      : failure(AucuneRuptureEnAttente(mediateurId))
  }
