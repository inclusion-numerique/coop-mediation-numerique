export type CycleDeVie =
  | { readonly _tag: 'InscriptionEnCours'; readonly creeLe: Date }
  | { readonly _tag: 'Inscrit'; readonly inscritLe: Date }
  | { readonly _tag: 'Supprime'; readonly depuis: Date }

export const cycleDeVie = ({
  creeLe,
  inscritLe,
  supprimeLe,
}: {
  readonly creeLe: Date
  readonly inscritLe: Date | null
  readonly supprimeLe: Date | null
}): CycleDeVie => {
  if (supprimeLe !== null) return { _tag: 'Supprime', depuis: supprimeLe }
  if (inscritLe !== null) return { _tag: 'Inscrit', inscritLe }
  return { _tag: 'InscriptionEnCours', creeLe }
}
