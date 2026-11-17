import type {
  PriseEnChargeSpecifique,
  PublicSpecifiquementAdresse,
} from '@gouvfr-anct/lieux-de-mediation-numerique'
import type { Fiche } from '../../../../domain/fiche'
import { aucuneValeur } from './section-vide'

export type TypesDePublicsAccueillisAffiches = {
  readonly toutPublic: boolean
  readonly publicsSpecifiquementAdresses: readonly PublicSpecifiquementAdresse[]
  readonly priseEnChargeSpecifique: readonly PriseEnChargeSpecifique[]
  readonly estVide: boolean
}

const accueilleToutPublic = ({
  publicsSpecifiquementAdresses,
}: Fiche): boolean => publicsSpecifiquementAdresses.length === 0

export const typesDePublicsAccueillis = (
  fiche: Fiche,
): TypesDePublicsAccueillisAffiches => ({
  toutPublic: accueilleToutPublic(fiche),
  publicsSpecifiquementAdresses: fiche.publicsSpecifiquementAdresses,
  priseEnChargeSpecifique: fiche.priseEnChargeSpecifique,
  estVide: aucuneValeur([
    fiche.publicsSpecifiquementAdresses,
    fiche.priseEnChargeSpecifique,
  ]),
})
