import { siIndisponible } from '@app/web/external-apis/apiAdresse'
import { geocodeStructureAdresse } from '@app/web/external-apis/ban/geocodeStructureAdresse'
import * as Sentry from '@sentry/nextjs'
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
        Sentry.captureException?.(erreur),
      ),
    )
