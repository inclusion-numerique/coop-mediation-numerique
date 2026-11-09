import { toTitleCase } from '@app/web/utils/toTitleCase'
import type { Nom } from '@gouvfr-anct/lieux-de-mediation-numerique'

export const nomAffiche = (nom: Nom): string =>
  toTitleCase(nom, { noUpper: true })
