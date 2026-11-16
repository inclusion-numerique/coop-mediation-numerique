import { instrument } from '@app/web/configuration/telemetry/instrument/server'
import { searchAdresse } from '@app/web/external-apis/apiAdresse'
import { communeFieldsFromAddress } from '@app/web/external-apis/ban/communeFieldsFromAddress'

const operation = {
  name: 'http.ban.search',
  service: 'base-adresse-nationale',
}

export const geocoder = (requete: string) =>
  instrument(operation, () => searchAdresse(requete))

export const communeDeLAdresse = (adresse: string) =>
  instrument(operation, () => communeFieldsFromAddress(adresse))
