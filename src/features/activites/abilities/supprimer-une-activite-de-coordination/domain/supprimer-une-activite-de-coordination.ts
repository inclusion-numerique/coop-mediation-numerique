import { failure, type Result, success } from '@/libraries/result'
import {
  ActionNonAutorisee,
  type ActiviteDeCoordinationId,
  ActiviteIntrouvable,
  type CoordinateurId,
} from '../../../domain'
import type { EchecDeSupprimerUneActiviteDeCoordination } from './errors'
import type {
  SuppressionDeLActiviteDeCoordination,
  SupprimerUneActiviteDeCoordinationPorts,
} from './ports'

export const supprimerUneActiviteDeCoordination =
  ({
    activiteEnregistree,
    supprimer,
  }: SupprimerUneActiviteDeCoordinationPorts) =>
  async ({
    activiteId,
    coordinateurId,
    maintenant,
  }: {
    readonly activiteId: ActiviteDeCoordinationId
    readonly coordinateurId: CoordinateurId | null
    readonly maintenant: Date
  }): Promise<
    Result<
      SuppressionDeLActiviteDeCoordination,
      EchecDeSupprimerUneActiviteDeCoordination
    >
  > => {
    const activite = await activiteEnregistree(activiteId)
    if (activite === null) return failure(ActiviteIntrouvable())
    if (activite.coordinateurId !== coordinateurId)
      return failure(ActionNonAutorisee())
    const suppression = { activite, suppression: maintenant }
    await supprimer(suppression)
    return success(suppression)
  }
