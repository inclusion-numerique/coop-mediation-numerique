import { signaler } from '@/configuration/telemetry/serveur'
import { geocoderPrecisement, siIndisponible } from '@/libraries/ban'
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
