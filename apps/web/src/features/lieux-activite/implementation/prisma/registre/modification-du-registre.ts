import { coopCartographieNationaleSource } from '@app/web/libraries/cartographie-nationale'
import {
  type DerniereModification,
  ModifieParSource,
  SourceCartographie,
} from '../../../domain/tracabilite'
import type { InscriptionPourLaFiche } from './fiche-du-registre'

export const derniereModificationExterne = (
  inscription: Pick<
    InscriptionPourLaFiche,
    'source' | 'updatedAtCarto' | 'updatedAtMin'
  >,
  modificationCoop: Date,
): DerniereModification | null => {
  const source = SourceCartographie.safe(inscription.source ?? '')

  if (source == null || source === coopCartographieNationaleSource) return null

  const dates = [inscription.updatedAtCarto, inscription.updatedAtMin].filter(
    (date): date is Date => date != null,
  )

  if (dates.length === 0) return null

  const derniere = dates.reduce((plus, date) => (date > plus ? date : plus))

  return derniere > modificationCoop ? ModifieParSource(derniere, source) : null
}
