import { type Reprise, reprise, type ValeursAReprendre } from '../../../domain'
import { courrielsAReprendre } from './courriels-a-reprendre'

const COLONNE = 'courriels'

const A_CORRIGER = 'à corriger'

export type ReprendreLesCourriels = (
  lieuId: string,
  aReprendre: ValeursAReprendre,
) => Promise<void>

const cellule = ({ perdues }: ValeursAReprendre): string =>
  perdues.length === 0 ? A_CORRIGER : perdues.join(' | ')

const motif = ({ perdues }: ValeursAReprendre): string =>
  perdues.length === 0 ? `${COLONNE} : ${A_CORRIGER}` : `${COLONNE} : à effacer`

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
