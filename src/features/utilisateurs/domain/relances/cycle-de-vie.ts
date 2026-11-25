import { JAMAIS, type Jalon } from './jalon'

export type CycleAvantSuppression =
  | { readonly _tag: 'InscriptionEnCours'; readonly creeLe: Date }
  | { readonly _tag: 'Inscrit'; readonly inscritLe: Date }

export type CycleDeVie =
  | CycleAvantSuppression
  | {
      readonly _tag: 'Supprime'
      readonly depuis: Date
      readonly avant: CycleAvantSuppression
    }

const avantSuppression = ({
  creeLe,
  inscritLe,
}: {
  readonly creeLe: Date
  readonly inscritLe: Date | null
}): CycleAvantSuppression =>
  inscritLe === null
    ? { _tag: 'InscriptionEnCours', creeLe }
    : { _tag: 'Inscrit', inscritLe }

export const cycleDeVie = ({
  creeLe,
  inscritLe,
  supprimeLe,
}: {
  readonly creeLe: Date
  readonly inscritLe: Date | null
  readonly supprimeLe: Date | null
}): CycleDeVie =>
  supprimeLe === null
    ? avantSuppression({ creeLe, inscritLe })
    : {
        _tag: 'Supprime',
        depuis: supprimeLe,
        avant: avantSuppression({ creeLe, inscritLe }),
      }

const inscriptionAvantSuppression = (cycle: CycleAvantSuppression): Jalon =>
  cycle._tag === 'Inscrit' ? { _tag: 'Le', date: cycle.inscritLe } : JAMAIS

export const inscription = (cycle: CycleDeVie): Jalon =>
  inscriptionAvantSuppression(cycle._tag === 'Supprime' ? cycle.avant : cycle)
