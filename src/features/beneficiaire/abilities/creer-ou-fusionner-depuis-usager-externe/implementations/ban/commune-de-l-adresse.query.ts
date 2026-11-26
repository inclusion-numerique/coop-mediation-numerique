import { instrument } from '@/configuration/telemetry/serveur'
import { siIndisponible } from '@/libraries/ban'
import { enEchecTechnique, failure, success } from '@/libraries/result'
import type { CommuneDeLAdresse } from '../../domain/ports'
import type { CommuneFields } from '../../domain/usager-externe'
import { champsDeCommuneDepuisLAdresse } from './champs-de-commune-depuis-l-adresse.transfer'

export const communeDeLAdresseAvec =
  (
    rechercher: (adresse: string) => Promise<CommuneFields | null>,
  ): CommuneDeLAdresse =>
  async (adresse) => {
    try {
      return success(await rechercher(adresse).catch(siIndisponible(null)))
    } catch (cause) {
      return failure(enEchecTechnique(cause))
    }
  }

export const communeDeLAdresse = communeDeLAdresseAvec((adresse) =>
  instrument(
    { name: 'http.ban.search', service: 'base-adresse-nationale' },
    () => champsDeCommuneDepuisLAdresse(adresse),
  ),
)
