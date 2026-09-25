import { type Reprise, reprise, type ValeursAReprendre } from '../../../domain'
import { courrielsAReprendre } from './courriels-a-reprendre'

const COLONNE = 'courriels'

export type ReprendreLesCourriels = (
  lieuId: string,
  aReprendre: ValeursAReprendre,
) => Promise<void>

const A_TRIER = 'à trier'

const A_CORRIGER = 'à corriger'

const A_EFFACER = 'à effacer'

const cellule = ({ perdues, rienQueLOrdre }: ValeursAReprendre): string => {
  if (perdues.length > 0) return perdues.join(' | ')

  return rienQueLOrdre ? A_TRIER : A_CORRIGER
}

const motif = ({ perdues, rienQueLOrdre }: ValeursAReprendre): string => {
  if (perdues.length > 0) return `${COLONNE} : ${A_EFFACER}`

  return `${COLONNE} : ${rienQueLOrdre ? A_TRIER : A_CORRIGER}`
}

export const repriseDesCourriels = (
  reprendreLesCourriels: ReprendreLesCourriels,
): Reprise =>
  reprise<ValeursAReprendre>({
    colonnes: [COLONNE],
    constater: courrielsAReprendre,
    mentions: (aReprendre) => [
      {
        colonne: COLONNE,
        cellule: cellule(aReprendre),
        motif: motif(aReprendre),
      },
    ],
    appliquer: reprendreLesCourriels,
  })
