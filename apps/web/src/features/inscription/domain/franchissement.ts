/**
 * Une étape de l'inscription est soit franchie (à une date), soit à franchir.
 * Modélise le `Date | null` du schéma comme un état explicite plutôt que comme
 * une absence ambiguë (même esprit que `ContactTelephone`).
 */
export type Franchissement =
  | { readonly _tag: 'franchi'; readonly le: Date }
  | { readonly _tag: 'aFranchir' }

/**
 * Constructeur total : une date présente vaut « franchi le … », son absence
 * vaut « à franchir ». La date interne reste un timestamp système (non brandé).
 */
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
