import { fetchSiretApiData } from '@app/web/external-apis/siret/fetchSiretData'
import {
  parseSireneIdentityForCompletion,
  type SireneIdentity,
} from '@app/web/libraries/siret'

// Résout l'identité d'une structure à partir de son SIRET (seule donnée coop de confiance) via l'API
// Recherche d'entreprises. Le nom vient de `nom_complet` (raison sociale, ou nom+prénom pour une EI ;
// masqué en `[Non-Diffusible]`) et les établissements fermés sont acceptés (donnée historique). Ne
// renvoie une erreur que si l'API ne trouve pas le SIRET. Partagé entre le job de complétion/couverture
// et le chemin d'écriture (ADR-002).
export const resolveIdentiteFromSiret = async (
  siret: string,
): Promise<{ identite: SireneIdentity } | { erreur: string }> => {
  const apiResult = await fetchSiretApiData(siret)
  if ('error' in apiResult) {
    return { erreur: apiResult.error.message }
  }
  return { identite: parseSireneIdentityForCompletion(apiResult) }
}
