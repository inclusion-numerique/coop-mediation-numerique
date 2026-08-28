import { SessionUser } from '@app/web/auth/sessionUser'

/**
 * « L'utilisateur n'a pas encore validé son inscription » — et rien de plus.
 *
 * ⚠ Ce prédicat ne regarde QUE `inscriptionValidee`. Un compte validé sans
 * compte de rôle (médiateur ou coordinateur) rend donc `false` alors que son
 * inscription n'est pas exploitable : c'est l'état fantôme de l'incident des
 * comptes sans rôle. Pour « l'inscription est-elle réellement aboutie », c'est
 * `hasInscriptionComplete` qu'il faut, pas l'inverse de cette fonction.
 *
 * L'élargir serait une régression pour la page d'accueil publique, qui s'en sert
 * pour décider de NE PAS rediriger : un compte fantôme y est aujourd'hui renvoyé
 * vers `getHomepage`, donc vers l'inscription — ce qui est le comportement voulu.
 */
export const isUserInscriptionEnCours = (user?: {
  role: SessionUser['role']
  inscriptionValidee: string | Date | null
}) => {
  if (!user) {
    return false
  }
  const { role, inscriptionValidee } = user

  return !inscriptionValidee && role !== 'Admin' && role !== 'Support'
}
