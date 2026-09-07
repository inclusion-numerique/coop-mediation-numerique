import { fetchSiretApiData } from '@app/web/external-apis/siret/fetchSiretData'
import {
  parseSireneIdentity,
  throttleApiEntreprise,
} from '@app/web/libraries/siret'
import type { InterrogerSirene } from '../../domain'

/**
 * Le seul code que `fetchSiretApiData` fabrique lui-même : l'API a répondu 200
 * et le SIRET ne figurait pas dans les résultats.
 */
const SIRET_ABSENT_DES_RESULTATS = 404

/**
 * Distingue une réponse d'une absence de réponse.
 *
 * Le client HTTP jette sur toute réponse non-ok — après huit tentatives pour
 * les pannes et les dépassements de quota, tout de suite pour les erreurs
 * client. `fetchSiretApiData` rattrape et rend 500. Un 404 ne peut donc venir
 * que de lui : c'est l'annuaire qui a répondu, et sa réponse est que ce numéro
 * ne désigne rien.
 */
export const laReponseEstNegative = ({
  statusCode,
}: {
  statusCode: number
}): boolean => statusCode === SIRET_ABSENT_DES_RESULTATS

/**
 * Interroge l'annuaire des entreprises et n'en retient que l'identité.
 *
 * La cadence est tenue ici : c'est une contrainte du fournisseur, pas une
 * règle de la vérification.
 *
 * Une panne de l'annuaire remonte en exception plutôt qu'en « SIRET inconnu ».
 * La différence n'est pas cosmétique : un SIRET inconnu est effacé, et une
 * indisponibilité pendant la passe de nuit effacerait tous les numéros qu'elle
 * atteint. Ne rien savoir n'est pas savoir que c'est faux.
 */
export const interrogerSirene: InterrogerSirene = async (siret) => {
  const reponse = await fetchSiretApiData(siret)

  await throttleApiEntreprise()

  if ('error' in reponse) {
    if (laReponseEstNegative(reponse.error)) return { connu: false }

    throw new Error(
      `l’annuaire des entreprises n’a pas répondu (${reponse.error.statusCode}) : ${reponse.error.message}`,
    )
  }

  const identite = parseSireneIdentity(reponse)

  return 'identity' in identite
    ? {
        connu: true,
        nom: identite.identity.nom,
        adresse: identite.identity.adresse,
      }
    : { connu: false }
}
