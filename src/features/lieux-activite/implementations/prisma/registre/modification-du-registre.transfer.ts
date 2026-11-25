import { coopCartographieNationaleSource } from '@/features/lieux-activite/domain/cartographie-nationale/sources'
import {
  type DerniereModification,
  ModifieParSource,
  SourceCartographie,
} from '../../../domain/registre/tracabilite'
import type { InscriptionPourLaFiche } from './fiche-du-registre.select'

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
