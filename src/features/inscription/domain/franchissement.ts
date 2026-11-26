export type Franchissement =
  | { readonly _tag: 'franchi'; readonly le: Date }
  | { readonly _tag: 'aFranchir' }

export const Franchissement = (
  date: Date | null | undefined,
): Franchissement =>
  date ? { _tag: 'franchi', le: date } : { _tag: 'aFranchir' }

export const estFranchi = (
  franchissement: Franchissement,
): franchissement is { readonly _tag: 'franchi'; readonly le: Date } =>
  franchissement._tag === 'franchi'

export const dateDeFranchissement = (
  franchissement: Franchissement,
): Date | null => (franchissement._tag === 'franchi' ? franchissement.le : null)
