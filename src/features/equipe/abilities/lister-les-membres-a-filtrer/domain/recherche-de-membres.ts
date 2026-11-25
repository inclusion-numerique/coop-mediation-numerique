import { contientSansAccent } from '@/libraries/texte'
import type { MembreAFiltrer } from './membre-a-filtrer'

const MEMBRES_TROUVES = 10

export const membresRecherches = (
  membres: readonly MembreAFiltrer[],
  recherche: string,
): readonly MembreAFiltrer[] =>
  membres
    .filter(
      ({ nom, email }) =>
        contientSansAccent(nom, recherche) ||
        contientSansAccent(email, recherche),
    )
    .slice(0, MEMBRES_TROUVES)
