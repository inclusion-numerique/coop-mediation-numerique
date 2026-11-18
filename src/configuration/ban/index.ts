import { searchAdresse } from '@/configuration/ban/apiAdresse'
import { instrument } from '@/configuration/telemetry/instrument/server'
import { communeFieldsFromAddress } from '@/features/adresse/implementation/api-adresse/communeFieldsFromAddress'

const operation = {
  name: 'http.ban.search',
  service: 'base-adresse-nationale',
}

export const geocoder = (requete: string) =>
  instrument(operation, () => searchAdresse(requete))

export const communeDeLAdresse = (adresse: string) =>
  instrument(operation, () => communeFieldsFromAddress(adresse))
