import { type Reprise, reprise } from '../../../domain'
import { type ColonneDeListe, colonnesATrier, LISTES } from './listes-a-trier'

const A_TRIER = 'à trier'

export type TrierLesListes = (
  lieuId: string,
  colonnes: readonly ColonneDeListe[],
) => Promise<void>

const colonnesDesordonnees = (
  lieu: Parameters<typeof colonnesATrier>[0],
): readonly ColonneDeListe[] | null => {
  const colonnes = colonnesATrier(lieu)

  return colonnes.length === 0 ? null : colonnes
}

export const triDesListes = (trierLesListes: TrierLesListes): Reprise =>
  reprise<readonly ColonneDeListe[]>({
    colonnes: LISTES,
    constater: colonnesDesordonnees,
    mentions: (colonnes) =>
      colonnes.map((colonne) => ({
        colonne,
        cellule: A_TRIER,
        motif: colonne,
      })),
    appliquer: trierLesListes,
  })
