import { searchAdresse } from '@/configuration/ban/apiAdresse'
import { communeFieldsFromAddress } from '@/configuration/ban/communeFieldsFromAddress'
import { instrument } from '@/configuration/telemetry/instrument/server'

const operation = {
  name: 'http.ban.search',
  service: 'base-adresse-nationale',
}

export const geocoder = (requete: string) =>
  instrument(operation, () => searchAdresse(requete))

export const communeDeLAdresse = (adresse: string) =>
  instrument(operation, () => communeFieldsFromAddress(adresse))
