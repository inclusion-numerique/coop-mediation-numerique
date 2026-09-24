import {
  ComplementAdresse,
  nettoyerComplementAdresse,
} from '@gouvfr-anct/lieux-de-mediation-numerique'
import type { LieuAReprendre, Reprise } from '../../../domain'
import { reprise } from '../../../domain'

const COLONNE = 'complementAdresse'

const A_CORRIGER = 'à corriger'

const A_EFFACER = 'à effacer'

export type ComplementAReprendre =
  | { readonly verdict: 'a-corriger'; readonly corrige: ComplementAdresse }
  | { readonly verdict: 'a-effacer'; readonly efface: string }

export type ReprendreLeComplement = (
  lieuId: string,
  complement: ComplementAdresse | null,
) => Promise<void>

export const complementAReprendre = (
  lieu: LieuAReprendre,
): ComplementAReprendre | null => {
  const complement = lieu.complementAdresse

  if (complement == null) return null

  const nettoye = nettoyerComplementAdresse(complement)

  if (nettoye === '') return { verdict: 'a-effacer', efface: complement }
  if (nettoye === complement) return null

  const corrige = ComplementAdresse.safe(nettoye)

  return corrige == null ? null : { verdict: 'a-corriger', corrige }
}

export const repriseDuComplementDAdresse = (
  reprendreLeComplement: ReprendreLeComplement,
): Reprise =>
  reprise<ComplementAReprendre>({
    colonnes: [COLONNE],
    constater: complementAReprendre,
    mentions: (aReprendre) => [
      aReprendre.verdict === 'a-corriger'
        ? {
            colonne: COLONNE,
            cellule: A_CORRIGER,
            motif: `${COLONNE} : ${A_CORRIGER}`,
          }
        : {
            colonne: COLONNE,
            cellule: JSON.stringify(aReprendre.efface),
            motif: `${COLONNE} : ${A_EFFACER}`,
          },
    ],
    appliquer: (lieuId, aReprendre) =>
      reprendreLeComplement(
        lieuId,
        aReprendre.verdict === 'a-corriger' ? aReprendre.corrige : null,
      ),
  })
