import type { MediateurId } from './mediateur-id'

export type MediateurIntrouvable = {
  readonly _tag: 'MediateurIntrouvable'
  readonly mediateurId: MediateurId
}

export const MediateurIntrouvable = (
  mediateurId: MediateurId,
): MediateurIntrouvable => ({ _tag: 'MediateurIntrouvable', mediateurId })
