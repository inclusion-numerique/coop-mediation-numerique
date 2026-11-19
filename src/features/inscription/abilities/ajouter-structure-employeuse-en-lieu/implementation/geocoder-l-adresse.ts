import { siIndisponible } from '@/configuration/ban/apiAdresse'
import { geocodeStructureAdresse } from '@/configuration/ban/geocodeStructureAdresse'
import { signaler } from '@/configuration/telemetry/error-reporter/server/signaler'
import type { Geocodage, GeocoderLAdresse } from '../domain/ports'

export const geocoderLAdresse: GeocoderLAdresse = (adresse) =>
  geocodeStructureAdresse(adresse)
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
