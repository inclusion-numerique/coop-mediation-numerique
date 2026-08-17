import type { CompteRdv } from '../../../domain/compte-rdv'

/**
 * État d'un compte tel que l'administration a besoin de le lire.
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
