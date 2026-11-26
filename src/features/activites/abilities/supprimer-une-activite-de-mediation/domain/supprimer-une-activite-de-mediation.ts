import { failure, type Result, success } from '@/libraries/result'
import {
  type ActiviteId,
  ActiviteIntrouvable,
  type BeneficiaireId,
  type MediateurId,
  type TypeDActivite,
} from '../../../domain'

export type ActiviteDeMediationASupprimer = {
  readonly id: ActiviteId
  readonly type: TypeDActivite
  readonly suivis: readonly BeneficiaireId[]
  readonly anonymesOrphelins: readonly BeneficiaireId[]
}

export type ActiviteDeMediationDuMediateur = (criteres: {
  readonly id: ActiviteId
  readonly mediateurId: MediateurId
}) => Promise<ActiviteDeMediationASupprimer | null>

export type SupprimerLActiviteDeMediation = (
  activite: ActiviteDeMediationASupprimer,
) => Promise<void>

export const supprimerUneActiviteDeMediation =
  ({
    activiteDuMediateur,
    supprimer,
  }: {
    readonly activiteDuMediateur: ActiviteDeMediationDuMediateur
    readonly supprimer: SupprimerLActiviteDeMediation
  }) =>
  async ({
    activiteId,
    mediateurId,
  }: {
    readonly activiteId: ActiviteId
    readonly mediateurId: MediateurId | null
  }): Promise<Result<void, ActiviteIntrouvable>> => {
    if (mediateurId === null) return failure(ActiviteIntrouvable())
    const activite = await activiteDuMediateur({ id: activiteId, mediateurId })
    if (activite === null) return failure(ActiviteIntrouvable())
    await supprimer(activite)
    return success(undefined)
  }
