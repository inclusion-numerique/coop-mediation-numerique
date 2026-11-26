import { failure, type Result, success } from '@/libraries/result'
import type {
  ActiviteDeCoordinationId,
  CoordinateurId,
  TypeDActiviteDeCoordination,
} from '../../../domain'
import {
  ActionNonAutorisee,
  ActiviteIntrouvable,
  type EchecDeSuppression,
} from './errors'

export type ActiviteDeCoordinationASupprimer = {
  readonly id: ActiviteDeCoordinationId
  readonly type: TypeDActiviteDeCoordination
  readonly coordinateurId: CoordinateurId
}

export type ActiviteDeCoordinationEnregistree = (
  id: ActiviteDeCoordinationId,
) => Promise<ActiviteDeCoordinationASupprimer | null>

export type SupprimerLActiviteDeCoordination = (
  activite: ActiviteDeCoordinationASupprimer,
) => Promise<void>

export const supprimerUneActiviteDeCoordination =
  ({
    activiteEnregistree,
    supprimer,
  }: {
    readonly activiteEnregistree: ActiviteDeCoordinationEnregistree
    readonly supprimer: SupprimerLActiviteDeCoordination
  }) =>
  async ({
    activiteId,
    coordinateurId,
  }: {
    readonly activiteId: ActiviteDeCoordinationId
    readonly coordinateurId: CoordinateurId | null
  }): Promise<Result<void, EchecDeSuppression>> => {
    const activite = await activiteEnregistree(activiteId)
    if (activite === null) return failure(ActiviteIntrouvable())
    if (activite.coordinateurId !== coordinateurId)
      return failure(ActionNonAutorisee())
    await supprimer(activite)
    return success(undefined)
  }
