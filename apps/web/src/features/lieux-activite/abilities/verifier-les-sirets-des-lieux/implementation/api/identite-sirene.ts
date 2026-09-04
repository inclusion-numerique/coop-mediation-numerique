import { fetchSiretApiData } from '@app/web/external-apis/siret/fetchSiretData'
import {
  parseSireneIdentity,
  throttleApiEntreprise,
} from '@app/web/libraries/siret'
import type { InterrogerSirene } from '../../domain'

/**
 * Interroge l'annuaire des entreprises et n'en retient que l'identité.
 *
 * La cadence est tenue ici : c'est une contrainte de l'API, pas une règle de
 * la vérification.
 *
 * ATTENTION — comportement conservé du job d'origine : une panne de l'API
 * (5xx, réseau) est rendue comme un SIRET inconnu, donc comme un SIRET à
 * effacer. Une indisponibilité de l'annuaire suffit à vider les colonnes
 * `siret` qu'elle atteint. Distinguer un 4xx (le numéro n'existe pas) d'un
 * 5xx (l'annuaire ne répond pas) demanderait de laisser remonter le second
 * pour qu'il compte comme un échec, sans écriture — c'est un changement de
 * comportement, pas un déplacement, et il n'a pas été fait ici.
 */
export const interrogerSirene: InterrogerSirene = async (siret) => {
  const reponse = await fetchSiretApiData(siret)

  await throttleApiEntreprise()

  if ('error' in reponse) return { connu: false }

  const identite = parseSireneIdentity(reponse)

  return 'identity' in identite
    ? {
        connu: true,
        nom: identite.identity.nom,
        adresse: identite.identity.adresse,
      }
    : { connu: false }
}
