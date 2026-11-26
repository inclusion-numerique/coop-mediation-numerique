import { type Result, success } from '@/libraries/result'
import type {
  CompteADetacher,
  Detachement,
  DetachementEffectue,
} from './detachement'
import type { DetacherDesEquipesPorts } from './ports'

export const detacherDesEquipes =
  ({ retirerDesEquipes }: DetacherDesEquipesPorts) =>
  async ({
    compte,
    maintenant,
  }: {
    readonly compte: CompteADetacher
    readonly maintenant: Date
  }): Promise<Result<DetachementEffectue, never>> => {
    if (compte._tag === 'SansEquipe')
      return success({
        detachement: null,
        bilan: { invitationsSupprimees: 0, appartenancesRetirees: 0 },
      })

    const detachement: Detachement = { compte, retireesLe: maintenant }

    return success({ detachement, bilan: await retirerDesEquipes(detachement) })
  }
