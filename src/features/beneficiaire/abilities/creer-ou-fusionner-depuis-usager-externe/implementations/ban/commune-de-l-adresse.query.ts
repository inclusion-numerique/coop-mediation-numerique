import { instrument } from '@/configuration/telemetry/serveur'
import { siIndisponible } from '@/libraries/ban'
import { attraperEnEchecTechnique } from '@/libraries/result'
import type { CommuneDeLAdresse } from '../../domain/ports'
import type { CommuneFields } from '../../domain/usager-externe'
import { champsDeCommuneDepuisLAdresse } from './champs-de-commune-depuis-l-adresse.transfer'

export const communeDeLAdresseAvec = (
  rechercher: (adresse: string) => Promise<CommuneFields | null>,
): CommuneDeLAdresse =>
  attraperEnEchecTechnique((adresse) =>
    rechercher(adresse).catch(siIndisponible(null)),
  )

export const communeDeLAdresse = communeDeLAdresseAvec((adresse) =>
  instrument(
    { name: 'http.ban.search', service: 'base-adresse-nationale' },
    () => champsDeCommuneDepuisLAdresse(adresse),
  ),
)
