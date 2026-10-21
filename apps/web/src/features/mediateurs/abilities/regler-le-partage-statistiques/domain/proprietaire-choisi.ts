import {
  type PerimetrePartage,
  type ProprietairePartage,
  proprietaireDuPerimetre,
  proprietairesPossibles,
  type Rattachements,
} from '@app/web/features/mediateurs/domain'
import { failure, type Result, success } from '@app/web/libraries/result'
import { AucuneStatistiqueAPartager, PerimetreNonRattache } from './errors'

export const proprietaireChoisi = (
  rattachements: Rattachements,
  perimetre: PerimetrePartage,
): Result<
  ProprietairePartage,
  AucuneStatistiqueAPartager | PerimetreNonRattache
> => {
  if (proprietairesPossibles(rattachements).length === 0)
    return failure(AucuneStatistiqueAPartager())

  const proprietaire = proprietaireDuPerimetre(rattachements, perimetre)
  return proprietaire === null
    ? failure(PerimetreNonRattache())
    : success(proprietaire)
}
