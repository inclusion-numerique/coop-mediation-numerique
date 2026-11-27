import { signaler } from '@/configuration/telemetry/serveur'
import { fetchSiretApiData } from '@/features/employeuse/implementations/api-entreprise/fetch-siret-data.query'
import { failure, success } from '@/libraries/result'
import { SireneIndisponible } from '../../domain/errors'
import type { LireLEtablissement } from '../../domain/ports'
import { etablissementSireneDepuis } from './etablissement-sirene.transfer'

export const etablissementDepuisSiret: LireLEtablissement = async (siret) => {
  const reponse = await fetchSiretApiData(siret)

  if ('error' in reponse) {
    signaler(
      new Error(
        `Recherche d’entreprises indisponible pour le SIRET ${siret} : ${reponse.error.statusCode} ${reponse.error.message}`,
      ),
    )
    return failure(SireneIndisponible())
  }

  return success(etablissementSireneDepuis(reponse.data))
}
