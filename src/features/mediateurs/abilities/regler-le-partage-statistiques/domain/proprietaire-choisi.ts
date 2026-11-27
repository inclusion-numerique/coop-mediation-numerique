import {
  type PerimetrePartage,
  type ProprietairePartage,
  proprietaireDuPerimetre,
  proprietairesPossibles,
  type Rattachements,
} from '@/features/mediateurs/domain'
import { failure, type Result, success } from '@/libraries/result'
import {
  AucuneStatistiqueAPartager,
  type EchecDeReglerLePartageStatistiques,
  PerimetreNonRattache,
} from './errors'

export const proprietaireChoisi = (
  rattachements: Rattachements,
  perimetre: PerimetrePartage,
): Result<ProprietairePartage, EchecDeReglerLePartageStatistiques> => {
  if (proprietairesPossibles(rattachements).length === 0)
    return failure(AucuneStatistiqueAPartager())

  const proprietaire = proprietaireDuPerimetre(rattachements, perimetre)
  return proprietaire === null
    ? failure(PerimetreNonRattache())
    : success(proprietaire)
}
