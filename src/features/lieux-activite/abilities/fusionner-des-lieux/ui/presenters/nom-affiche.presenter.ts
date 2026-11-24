import type { Nom } from '@gouvfr-anct/lieux-de-mediation-numerique'
import { toTitleCase } from '@/libraries/texte/to-title-case'

export const nomAffiche = (nom: Nom): string =>
  toTitleCase(nom, { noUpper: true })
