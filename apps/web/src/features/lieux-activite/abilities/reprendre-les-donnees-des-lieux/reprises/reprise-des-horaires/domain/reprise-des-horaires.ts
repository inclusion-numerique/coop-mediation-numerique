import { type Reprise, reprise } from '../../../domain'
import {
  type HorairesAReprendre,
  horairesAReprendre,
} from './horaires-a-reprendre'

const COLONNE = 'horaires'

const A_CORRIGER = 'à corriger'

const A_DEPLACER = 'À déplacer dans le champ description'

const A_EFFACER = 'à effacer'

export type ReprendreLesHoraires = (
  lieuId: string,
  aReprendre: HorairesAReprendre,
) => Promise<void>

const cellule = (aReprendre: HorairesAReprendre): string => {
  if (aReprendre.verdict === 'a-corriger') return A_CORRIGER
  if (aReprendre.verdict === 'a-deplacer') return A_DEPLACER

  return aReprendre.valeur
}

const motif = (aReprendre: HorairesAReprendre): string => {
  if (aReprendre.verdict === 'a-corriger') return `${COLONNE} : ${A_CORRIGER}`
  if (aReprendre.verdict === 'a-deplacer')
    return `${COLONNE} : vers la description`

  return `${COLONNE} : ${A_EFFACER}`
}

export const repriseDesHoraires = (
  reprendreLesHoraires: ReprendreLesHoraires,
): Reprise =>
  reprise<HorairesAReprendre>({
    colonnes: [COLONNE],
    constater: horairesAReprendre,
    mentions: (aReprendre) => [
      {
        colonne: COLONNE,
        cellule: cellule(aReprendre),
        motif: motif(aReprendre),
      },
    ],
    appliquer: reprendreLesHoraires,
  })
