import { toTitleCase } from '@app/web/utils/toTitleCase'
import type { Nom } from '@gouvfr-anct/lieux-de-mediation-numerique'

/**
 * Le nom tel qu'on l'affiche.
 *
 * La casse est une décision de rendu : les producteurs livrent des noms en
 * capitales, la coop les présente en casse de titre. Elle ne descend pas dans
 * la lecture, sinon le nom stocké et le nom relu diffèreraient sans que rien ne
 * le dise.
 */
export const nomAffiche = (nom: Nom): string =>
  toTitleCase(nom, { noUpper: true })
