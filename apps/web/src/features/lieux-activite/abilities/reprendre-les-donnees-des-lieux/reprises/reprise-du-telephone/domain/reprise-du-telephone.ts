import { type Reprise, reprise } from '../../../domain'
import {
  type TelephoneAReprendre,
  telephoneAReprendre,
} from './telephone-a-reprendre'

const COLONNE = 'telephone'

const A_CORRIGER = 'à corriger'

export type ReprendreLeTelephone = (
  lieuId: string,
  aReprendre: TelephoneAReprendre,
) => Promise<void>

export const repriseDuTelephone = (
  reprendreLeTelephone: ReprendreLeTelephone,
): Reprise =>
  reprise<TelephoneAReprendre>({
    colonnes: [COLONNE],
    constater: telephoneAReprendre,
    mentions: (aReprendre) => [
      {
        colonne: COLONNE,
        cellule:
          aReprendre.verdict === 'a-corriger' ? A_CORRIGER : aReprendre.valeur,
        motif:
          aReprendre.verdict === 'a-corriger'
            ? `${COLONNE} : ${A_CORRIGER}`
            : `${COLONNE} : à effacer`,
      },
    ],
    appliquer: reprendreLeTelephone,
  })
