import { type Result, success } from '@/libraries/result'
import { messageDeLEchec } from './errors'
import type { MediateurId } from './identifiants/mediateur-id'
import type { UsagerId } from './identifiants/usager-id'
import type { DemandeDeRapprochement, RapprochementPorts } from './ports'

export type Rapprochement =
  | { readonly _tag: 'sansObjet' }
  | ({
      readonly _tag: 'reussi'
      readonly ecartes: number
    } & DemandeDeRapprochement)
  | {
      readonly _tag: 'echoue'
      readonly usagerIds: readonly UsagerId[]
      readonly mediateurId: MediateurId
      readonly message: string
    }

export const rapprocherLesUsagers =
  ({
    lireLesUsagersARapprocher,
    rapprocherLesBeneficiaires,
  }: RapprochementPorts) =>
  async ({
    usagerIds,
    mediateurId,
    maintenant,
  }: {
    readonly usagerIds: readonly UsagerId[]
    readonly mediateurId: MediateurId | null
    readonly maintenant: Date
  }): Promise<Result<Rapprochement, never>> => {
    if (mediateurId === null || usagerIds.length === 0) {
      return success({ _tag: 'sansObjet' })
    }

    const usagers = await lireLesUsagersARapprocher(usagerIds)

    if (!usagers.success) {
      return success({
        _tag: 'echoue',
        usagerIds,
        mediateurId,
        message: messageDeLEchec(usagers.error),
      })
    }

    const demande = { usagers: usagers.data, mediateurId, maintenant }
    const rapprochement = await rapprocherLesBeneficiaires(demande)

    return success({
      _tag: 'reussi',
      ...demande,
      ecartes: rapprochement.data.skipped.length,
    })
  }
