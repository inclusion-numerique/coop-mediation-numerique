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
 * Ce que les écrans montrent de l'intégration.
 *
 * Quatre états, là où cinq suffisent au diagnostic : un jeton expiré passe pour
 * connecté, puisqu'il se renouvelle au prochain appel. Mais `deconnecte` reste
 * distinct de `jamaisConnecte`, et c'est le point de la distinction — les
 * confondre présentait comme neuf un outil que le médiateur venait de débrancher,
 * et les confondre dans l'autre sens présentait sa décision comme une panne.
 *
 * `jamaisConnecte` ne sort jamais d'ici : c'est la valeur que prennent les écrans
 * quand aucun compte n'existe, donc quand il n'y a pas de santé à lire.
 *
 * Cette dérivation existait en double. Une seconde version, calculée depuis la
 * session, ne connaissait que la présence de jetons et le message d'erreur : un
 * compte que l'utilisateur avait débranché lui-même y apparaissait cassé, faute
 * de distinguer une purge de jetons d'une révocation.
 */
export type StatutIntegration =
  | 'jamaisConnecte'
  | 'connecte'
  | 'deconnecte'
  | 'enPanne'

export const statutIntegration = (sante: SanteCompteRdv): StatutIntegration => {
  if (sante._tag === 'deconnecteParUtilisateur') {
    return 'deconnecte'
  }

  // Un compte dont le parcours OAuth n'a jamais abouti est une panne, pas une
  // absence : la ligne existe, elle n'aurait pas dû rester dans cet état.
  return sante._tag === 'enErreur' || sante._tag === 'jamaisLie'
    ? 'enPanne'
    : 'connecte'
}
