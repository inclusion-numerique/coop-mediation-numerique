import { signaler } from '@/configuration/telemetry/serveur'
import type { AdresseBanData } from '@/libraries/adresse'
import { geocoderPrecisement, siIndisponible } from '@/libraries/ban'
import { CodePostal } from '@/libraries/code-postal'
import { CodeInsee } from '@/libraries/insee'
import type { Geocodage, GeocoderLAdresse } from '../../domain/ports'

const geocodage = (adresseBan: AdresseBanData | null): Geocodage => {
  const codePostal =
    adresseBan === null ? null : CodePostal.safe(adresseBan.codePostal)
  const codeInsee =
    adresseBan === null ? null : CodeInsee.safe(adresseBan.codeInsee)

  return adresseBan === null || codePostal === null || codeInsee === null
    ? { _tag: 'AdresseInconnue' }
    : {
        _tag: 'AdresseReconnue',
        adresse: {
          id: adresseBan.id,
          nom: adresseBan.nom,
          commune: adresseBan.commune,
          codePostal,
          codeInsee,
          latitude: adresseBan.latitude,
          longitude: adresseBan.longitude,
        },
      }
}

export const geocoderLAdresse: GeocoderLAdresse = (adresse) =>
  geocoderPrecisement(adresse)
    .then((adresseBan) => geocodage(adresseBan ?? null))
    .catch(
      siIndisponible<Geocodage>({ _tag: 'ServiceIndisponible' }, (erreur) =>
        signaler(erreur),
      ),
    )
