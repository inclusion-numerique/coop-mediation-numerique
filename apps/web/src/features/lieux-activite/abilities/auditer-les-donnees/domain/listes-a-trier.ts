import { diagnostiquer, type LigneAAuditer } from './anomalie'

const CODES_DE_LISTE: ReadonlySet<string> = new Set([
  'liste-desordonnee',
  'liste-en-doublon',
])

/**
 * Les colonnes de vocabulaire d'un lieu qui sont à reprendre.
 *
 * Elles se déduisent du diagnostic plutôt que d'un second calcul : la reprise
 * répare ainsi exactement ce que la détection signale, et les deux ne peuvent
 * pas diverger.
 *
 * La reprise ne trie rien elle-même. Lire un lieu par le transfer le rend déjà
 * trié — les modèles du standard dédoublonnent et ordonnent à la construction —
 * et il ne reste qu'à réécrire ce que la lecture a produit.
 */
export const listesATrier = (ligne: LigneAAuditer): readonly string[] => [
  ...new Set(
    diagnostiquer(ligne)
      .filter(({ code }) => CODES_DE_LISTE.has(code))
      .map(({ champ }) => champ),
  ),
]
