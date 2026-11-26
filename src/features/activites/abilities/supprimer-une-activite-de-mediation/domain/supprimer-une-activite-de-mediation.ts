import { failure, type Result, success } from '@/libraries/result'
import {
  type ActiviteId,
  ActiviteIntrouvable,
  type MediateurId,
} from '../../../domain'
import type { EchecDeSupprimerUneActiviteDeMediation } from './errors'
import type {
  SuppressionDeLActiviteDeMediation,
  SupprimerUneActiviteDeMediationPorts,
} from './ports'

export const supprimerUneActiviteDeMediation =
  ({ activiteDuMediateur, supprimer }: SupprimerUneActiviteDeMediationPorts) =>
  async ({
    activiteId,
    mediateurId,
    maintenant,
  }: {
    readonly activiteId: ActiviteId
    readonly mediateurId: MediateurId | null
    readonly maintenant: Date
  }): Promise<
    Result<
      SuppressionDeLActiviteDeMediation,
      EchecDeSupprimerUneActiviteDeMediation
    >
  > => {
    if (mediateurId === null) return failure(ActiviteIntrouvable())
    const activite = await activiteDuMediateur({ id: activiteId, mediateurId })
    if (activite === null) return failure(ActiviteIntrouvable())
    const suppression = { activite, suppression: maintenant }
    await supprimer(suppression)
    return success(suppression)
  }
