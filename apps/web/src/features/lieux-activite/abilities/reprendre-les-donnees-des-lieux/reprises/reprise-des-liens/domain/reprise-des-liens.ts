import {
  FicheAccesLibre,
  nettoyerSiteWeb,
  Url,
} from '@gouvfr-anct/lieux-de-mediation-numerique'
import type { LieuAReprendre, Reprise } from '../../../domain'
import { reprise } from '../../../domain'

const A_CORRIGER = 'à corriger'

const A_EFFACER = 'à effacer'

export type Lien = 'ficheAccesLibre' | 'priseRdv'

export type LienAReprendre =
  | { readonly verdict: 'a-corriger'; readonly corrige: string }
  | { readonly verdict: 'a-effacer'; readonly efface: string }

export type ReprendreLeLien = (
  lieuId: string,
  lien: Lien,
  valeur: string | null,
) => Promise<void>

type Valider = (valeur: string) => string | null

const VALIDATIONS: Readonly<Record<Lien, Valider>> = {
  ficheAccesLibre: (valeur) => FicheAccesLibre.safe(valeur),
  priseRdv: (valeur) => Url.safe(valeur),
}

export const lienAReprendre =
  (lien: Lien) =>
  (lieu: LieuAReprendre): LienAReprendre | null => {
    const valeur = lieu[lien]
    const valider = VALIDATIONS[lien]

    if (valeur == null || (valeur.trim() !== '' && valider(valeur) != null))
      return null

    const nettoye = valeur.trim() === '' ? '' : nettoyerSiteWeb(valeur)
    const corrige = nettoye === '' ? null : valider(nettoye)

    return corrige == null
      ? { verdict: 'a-effacer', efface: valeur }
      : { verdict: 'a-corriger', corrige }
  }

export const repriseDuLien = (
  lien: Lien,
  reprendreLeLien: ReprendreLeLien,
): Reprise =>
  reprise<LienAReprendre>({
    colonnes: [lien],
    constater: lienAReprendre(lien),
    mentions: (aReprendre) => [
      aReprendre.verdict === 'a-corriger'
        ? {
            colonne: lien,
            cellule: A_CORRIGER,
            motif: `${lien} : ${A_CORRIGER}`,
          }
        : {
            colonne: lien,
            cellule: JSON.stringify(aReprendre.efface),
            motif: `${lien} : ${A_EFFACER}`,
          },
    ],
    appliquer: (lieuId, aReprendre) =>
      reprendreLeLien(
        lieuId,
        lien,
        aReprendre.verdict === 'a-corriger' ? aReprendre.corrige : null,
      ),
  })
