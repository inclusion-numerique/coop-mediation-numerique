import type { MediateurId } from '@app/web/features/mediateurs/domain'

export type MediateurIntrouvable = {
  readonly _tag: 'MediateurIntrouvable'
  readonly mediateurId: MediateurId
}

export const MediateurIntrouvable = (
  mediateurId: MediateurId,
): MediateurIntrouvable => ({ _tag: 'MediateurIntrouvable', mediateurId })

export type AucuneRuptureEnAttente = {
  readonly _tag: 'AucuneRuptureEnAttente'
  readonly mediateurId: MediateurId
}

export const AucuneRuptureEnAttente = (
  mediateurId: MediateurId,
): AucuneRuptureEnAttente => ({ _tag: 'AucuneRuptureEnAttente', mediateurId })

export type ConfirmerLExerciceApresRuptureError =
  | MediateurIntrouvable
  | AucuneRuptureEnAttente
