import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

export const JetonAcces = defineModel(z.string().min(1).brand('JetonAcces'))
export type JetonAcces = Model.TypeOf<typeof JetonAcces>

export const JetonRafraichissement = defineModel(
  z.string().min(1).brand('JetonRafraichissement'),
)
export type JetonRafraichissement = Model.TypeOf<typeof JetonRafraichissement>

export const PorteeOAuth = defineModel(z.string().min(1).brand('PorteeOAuth'))
export type PorteeOAuth = Model.TypeOf<typeof PorteeOAuth>

/**
 * Les quatre colonnes OAuth de `rdv_accounts` ne servent jamais séparément :
 * appeler l'API demande le jeton d'accès, savoir s'il faut le renouveler demande
 * l'expiration, et le renouveler demande le jeton de rafraîchissement (DM-7).
 *
 * `rafraichissement`, `expiration` et `portee` sont nullables parce que RDV
 * Service Public ne les renvoie pas systématiquement — un compte lié sans jeton
 * de rafraîchissement est utilisable jusqu'à expiration, puis devient
 * `CompteRdvEnErreur`. Seul le jeton d'accès conditionne la liaison.
 */
export type JetonsOAuth = {
  readonly acces: JetonAcces
  readonly rafraichissement: JetonRafraichissement | null
  readonly expiration: Date | null
  readonly portee: PorteeOAuth | null
}

/** Marge avant expiration en deçà de laquelle on renouvelle par anticipation. */
export const MARGE_RENOUVELLEMENT_MS = 60_000

/**
 * Un jeton sans expiration connue est réputé valide : c'est la réponse de l'API
 * qui tranchera. Renouveler à l'aveugle coûterait un aller-retour à chaque appel.
 */
export const jetonsARenouveler = (
  { expiration }: JetonsOAuth,
  maintenant: Date,
): boolean =>
  expiration !== null &&
  expiration.getTime() - maintenant.getTime() < MARGE_RENOUVELLEMENT_MS
