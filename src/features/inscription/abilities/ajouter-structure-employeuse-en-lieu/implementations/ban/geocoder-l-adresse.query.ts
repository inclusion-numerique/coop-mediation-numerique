import { signaler } from '@/configuration/telemetry/error-reporter/server/signaler'
import { siIndisponible } from '@/libraries/ban/api-adresse'
import { geocoderPrecisement } from '@/libraries/ban/geocoder-precisement'
import type { Geocodage, GeocoderLAdresse } from '../../domain/ports'

export const geocoderLAdresse: GeocoderLAdresse = (adresse) =>
  geocoderPrecisement(adresse)
    .then(
      (adresseBan): Geocodage =>
        adresseBan == null
          ? { _tag: 'AdresseInconnue' }
          : { _tag: 'AdresseReconnue', adresse: adresseBan },
    )
    .catch(
      siIndisponible<Geocodage>({ _tag: 'ServiceIndisponible' }, (erreur) =>
        signaler(erreur),
      ),
    )
