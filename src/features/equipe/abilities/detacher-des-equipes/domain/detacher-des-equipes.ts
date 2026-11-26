import { type Result, success } from '@/libraries/result'
import type { CoordinateurId, MediateurId } from '../../../domain'
import type { Detachement, DetachementEffectue } from './detachement'
import type { DetacherDesEquipesPorts } from './ports'

export const detacherDesEquipes =
  ({ retirerDesEquipes }: DetacherDesEquipesPorts) =>
  async ({
    mediateurId,
    coordinateurId,
    maintenant,
  }: {
    readonly mediateurId: MediateurId | null
    readonly coordinateurId: CoordinateurId | null
    readonly maintenant: Date
  }): Promise<Result<DetachementEffectue, never>> => {
    if (mediateurId === null && coordinateurId === null)
      return success({
        detachement: null,
        bilan: { invitationsSupprimees: 0, appartenancesRetirees: 0 },
      })

    const detachement: Detachement = {
      mediateurId,
      coordinateurId,
      retireesLe: maintenant,
    }

    return success({ detachement, bilan: await retirerDesEquipes(detachement) })
  }
