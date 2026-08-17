import type { CompteRdv } from './compte-rdv'

/**
 * État d'un compte RDV Service Public.
 *
 * L'écran d'administration se contentait d'un booléen — des jetons, ou pas — qui
 * confondait quatre situations très différentes à traiter : un compte que
 * l'utilisateur a débranché, un compte dont le parcours OAuth n'a jamais abouti,
 * un compte dont le jeton a été révoqué, et un compte qui fonctionne. Les
 * distinguer, c'est savoir qui contacter et pourquoi.
 */
export type SanteCompteRdv =
  | { readonly _tag: 'operationnel' }
  | { readonly _tag: 'jetonExpire'; readonly depuis: Date }
  | { readonly _tag: 'enErreur'; readonly message: string }
  | { readonly _tag: 'jamaisLie' }
  | { readonly _tag: 'deconnecteParUtilisateur'; readonly quand: Date }

export const santeDuCompte = (
  compte: CompteRdv,
  maintenant: Date,
): SanteCompteRdv => {
  if (compte._tag === 'deconnecte') {
    return {
      _tag: 'deconnecteParUtilisateur',
      quand: compte.deconnexion,
    }
  }

  if (compte._tag === 'nonLie') {
    return { _tag: 'jamaisLie' }
  }

  if (compte._tag === 'enErreur') {
    return { _tag: 'enErreur', message: compte.erreur }
  }

  const { expiration } = compte.jetons

  // Un jeton expiré n'est pas une panne : le renouvellement se fait au prochain
  // appel. Le signaler à part évite de mobiliser l'assistance pour rien.
  return expiration !== null && expiration <= maintenant
    ? { _tag: 'jetonExpire', depuis: expiration }
    : { _tag: 'operationnel' }
}

/**
 * Un compte réclame-t-il une intervention humaine ? Ni l'expiration d'un jeton
 * ni une déconnexion volontaire n'en demandent.
 */
export const reclameUneIntervention = (sante: SanteCompteRdv): boolean =>
  sante._tag === 'enErreur' || sante._tag === 'jamaisLie'

/**
 * Un compte peut-il être synchronisé ? Il lui faut des jetons, même périmés ou
 * refusés : le renouvellement se tente au moment de l'appel, et c'est en
 * réessayant qu'un compte en erreur en sort.
 */
export const peutEtreSynchronise = (sante: SanteCompteRdv): boolean =>
  sante._tag === 'operationnel' ||
  sante._tag === 'jetonExpire' ||
  sante._tag === 'enErreur'

/**
 * Ce que les écrans montrent de l'intégration : trois états, pas cinq.
 *
 * `none` couvre l'absence d'intégration comme la déconnexion volontaire — il n'y
 * a rien à réparer dans les deux cas. Un jeton expiré passe pour opérationnel :
 * il se renouvelle au prochain appel.
 *
 * Cette dérivation existait en double. Une seconde version, calculée depuis la
 * session, ne connaissait que la présence de jetons et le message d'erreur : un
 * compte que l'utilisateur avait débranché lui-même y apparaissait cassé, faute
 * de distinguer une purge de jetons d'une révocation.
 */
export type StatutIntegration = 'none' | 'success' | 'error'

export const statutIntegration = (sante: SanteCompteRdv): StatutIntegration => {
  if (sante._tag === 'deconnecteParUtilisateur') {
    return 'none'
  }

  return sante._tag === 'enErreur' || sante._tag === 'jamaisLie'
    ? 'error'
    : 'success'
}
