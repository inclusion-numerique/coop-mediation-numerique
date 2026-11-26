import type { Result } from '@/libraries/result'
import {
  type ErreurTechnique,
  messageDeLEchec,
  type RapprochementEchoue,
} from './errors'
import type { UsagerId } from './identifiants/usager-id'

export type UsagerExterne = {
  readonly rdvUserId: number
  readonly nom: string | null
  readonly prenom: string | null
  readonly telephone: string | null
  readonly email: string | null
  readonly adresse: string | null
  readonly birthDate: Date | null
}

export type DemandeDeRapprochement = {
  readonly usagers: readonly UsagerExterne[]
  readonly mediateurId: string
}

export type LireLesUsagersARapprocher = (
  usagerIds: readonly UsagerId[],
) => Promise<Result<readonly UsagerExterne[], ErreurTechnique>>

export type RapprocherLesBeneficiaires = (
  demande: DemandeDeRapprochement,
) => Promise<Result<{ readonly ecartes: number }, RapprochementEchoue>>

export type Rapprochement =
  | { readonly _tag: 'sansObjet' }
  | ({
      readonly _tag: 'reussi'
      readonly ecartes: number
    } & DemandeDeRapprochement)
  | {
      readonly _tag: 'echoue'
      readonly usagerIds: readonly UsagerId[]
      readonly mediateurId: string
      readonly message: string
    }

export const rapprocherLesUsagers = async (
  {
    lireLesUsagersARapprocher,
    rapprocherLesBeneficiaires,
  }: {
    readonly lireLesUsagersARapprocher: LireLesUsagersARapprocher
    readonly rapprocherLesBeneficiaires: RapprocherLesBeneficiaires
  },
  {
    usagerIds,
    mediateurId,
  }: {
    readonly usagerIds: readonly UsagerId[]
    readonly mediateurId: string | null
  },
): Promise<Rapprochement> => {
  if (mediateurId === null || usagerIds.length === 0) {
    return { _tag: 'sansObjet' }
  }

  const usagers = await lireLesUsagersARapprocher(usagerIds)

  if (!usagers.success) {
    return {
      _tag: 'echoue',
      usagerIds,
      mediateurId,
      message: messageDeLEchec(usagers.error),
    }
  }

  const rapprochement = await rapprocherLesBeneficiaires({
    usagers: usagers.data,
    mediateurId,
  })

  return rapprochement.success
    ? {
        _tag: 'reussi',
        usagers: usagers.data,
        mediateurId,
        ecartes: rapprochement.data.ecartes,
      }
    : {
        _tag: 'echoue',
        usagerIds,
        mediateurId,
        message: rapprochement.error.message,
      }
}
