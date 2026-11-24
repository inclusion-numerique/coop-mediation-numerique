import { instrument } from '@/configuration/telemetry/instrument/server'
import { searchAdresse } from '@/libraries/ban/api-adresse'

const operation = {
  name: 'http.ban.search',
  service: 'base-adresse-nationale',
}

export const geocoder = (requete: string) =>
  instrument(operation, () => searchAdresse(requete))
