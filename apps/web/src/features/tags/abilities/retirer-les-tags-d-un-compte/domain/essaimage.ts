import type { MediateurId } from '../../../domain'

export type EssaimageCoordinateur =
  | { readonly _tag: 'essaime'; readonly vers: readonly MediateurId[] }
  | { readonly _tag: 'supprime' }

export const essaimageDesTagsDuCoordinateur = (
  utilisateurs: readonly MediateurId[],
): EssaimageCoordinateur => {
  const distincts = [...new Set(utilisateurs)]

  return distincts.length === 0
    ? { _tag: 'supprime' }
    : { _tag: 'essaime', vers: distincts }
}
