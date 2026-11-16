import { signaler } from '@app/web/configuration/telemetry/error-reporter/server/signaler'
import { siIndisponible } from '@app/web/external-apis/apiAdresse'
import { geocodeStructureAdresse } from '@app/web/external-apis/ban/geocodeStructureAdresse'
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
