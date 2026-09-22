import { type Reprise, reprise, type ValeursAReprendre } from '../../../domain'
import { sitesWebAReprendre } from './sites-web-a-reprendre'

const COLONNE = 'siteWeb'

const A_CORRIGER = 'à corriger'

export type ReprendreLesSitesWeb = (
  lieuId: string,
  aReprendre: ValeursAReprendre,
) => Promise<void>

const cellule = ({ perdues }: ValeursAReprendre): string =>
  perdues.length === 0 ? A_CORRIGER : perdues.join(' | ')

const motif = ({ perdues }: ValeursAReprendre): string =>
  perdues.length === 0 ? `${COLONNE} : ${A_CORRIGER}` : `${COLONNE} : à effacer`

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
