import type { Nom } from '@gouvfr-anct/lieux-de-mediation-numerique'
import { toTitleCase } from '@/libraries/texte'

export const nomAffiche = (nom: Nom): string =>
  toTitleCase(nom, { noUpper: true })
