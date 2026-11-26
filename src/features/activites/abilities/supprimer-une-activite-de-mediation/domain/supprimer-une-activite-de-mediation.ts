import { failure, type Result, success } from '@/libraries/result'
import {
  type ActiviteId,
  ActiviteIntrouvable,
  type MediateurId,
} from '../../../domain'
import type { EchecDeSupprimerUneActiviteDeMediation } from './errors'
import type {
  ActiviteDeMediationASupprimer,
  ActiviteDeMediationLue,
  ParticipantDeLActivite,
  SuppressionDeLActiviteDeMediation,
  SupprimerUneActiviteDeMediationPorts,
} from './ports'

const estOrphelin = ({
  anonyme,
  autresAccompagnements,
}: ParticipantDeLActivite): boolean => anonyme && autresAccompagnements === 0

const aSupprimer = ({
  id,
  type,
  participants,
}: ActiviteDeMediationLue): ActiviteDeMediationASupprimer => ({
  id,
  type,
  suivis: participants
    .filter(({ anonyme }) => !anonyme)
    .map(({ beneficiaireId }) => beneficiaireId),
  anonymesOrphelins: participants
    .filter(estOrphelin)
    .map(({ beneficiaireId }) => beneficiaireId),
})

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
    const suppression = {
      activite: aSupprimer(activite),
      suppression: maintenant,
    }
    await supprimer(suppression)
    return success(suppression)
  }
