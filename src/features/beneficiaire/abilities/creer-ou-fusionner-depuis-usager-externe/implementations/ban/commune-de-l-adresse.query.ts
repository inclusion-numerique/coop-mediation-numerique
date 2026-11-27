import { instrument } from '@/configuration/telemetry/serveur'
import type { CommuneResidence } from '@/features/beneficiaire/domain/commune-residence'
import { siIndisponible } from '@/libraries/ban'
import { attraperEnEchecTechnique } from '@/libraries/result'
import type { CommuneDeLAdresse } from '../../domain/ports'
import { champsDeCommuneDepuisLAdresse } from './champs-de-commune-depuis-l-adresse.transfer'

export const communeDeLAdresseAvec = (
  rechercher: (adresse: string) => Promise<CommuneResidence | null>,
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
