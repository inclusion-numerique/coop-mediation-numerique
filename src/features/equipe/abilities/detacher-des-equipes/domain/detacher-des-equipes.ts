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
        _tag: 'SansEquipe',
        bilan: { invitationsSupprimees: 0, appartenancesRetirees: 0 },
      })

    const detachement: Detachement = { compte, retireesLe: maintenant }

    return success({
      _tag: 'Detache',
      detachement,
      bilan: await retirerDesEquipes(detachement),
    })
  }
