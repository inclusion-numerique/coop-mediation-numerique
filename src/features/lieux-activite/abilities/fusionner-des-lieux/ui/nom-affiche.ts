import type { Nom } from '@gouvfr-anct/lieux-de-mediation-numerique'
import { toTitleCase } from '@/utils/toTitleCase'

export const nomAffiche = (nom: Nom): string =>
  toTitleCase(nom, { noUpper: true })
