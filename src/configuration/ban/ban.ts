import { instrument } from '@/configuration/telemetry/serveur'
import { searchAdresse } from '@/libraries/ban'

const operation = {
  name: 'http.ban.search',
  service: 'base-adresse-nationale',
}

export const geocoder = (requete: string) =>
  instrument(operation, () => searchAdresse(requete))
