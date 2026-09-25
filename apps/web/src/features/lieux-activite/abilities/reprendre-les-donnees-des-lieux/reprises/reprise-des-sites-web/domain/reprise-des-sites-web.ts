import { type Reprise, reprise, type ValeursAReprendre } from '../../../domain'
import { sitesWebAReprendre } from './sites-web-a-reprendre'

const COLONNE = 'siteWeb'

export type ReprendreLesSitesWeb = (
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

export const repriseDesSitesWeb = (
  reprendreLesSitesWeb: ReprendreLesSitesWeb,
): Reprise =>
  reprise<ValeursAReprendre>({
    colonnes: [COLONNE],
    constater: sitesWebAReprendre,
    mentions: (aReprendre) => [
      {
        colonne: COLONNE,
        cellule: cellule(aReprendre),
        motif: motif(aReprendre),
      },
    ],
    appliquer: reprendreLesSitesWeb,
  })
