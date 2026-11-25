import { instrument } from '@/configuration/telemetry/serveur'
import { champsDeCommuneDepuisLAdresse } from './champs-de-commune-depuis-l-adresse.transfer'

export const communeDeLAdresse = (adresse: string) =>
  instrument(
    { name: 'http.ban.search', service: 'base-adresse-nationale' },
    () => champsDeCommuneDepuisLAdresse(adresse),
  )
