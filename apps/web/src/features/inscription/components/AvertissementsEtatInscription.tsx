import { isUserInscriptionEnCours } from '@app/web/auth/isUserInscriptionEnCours'
import type { SessionUser } from '@app/web/auth/sessionUser'
import { hasInscriptionComplete } from '@app/web/security/getHomepage'
import Notice from '@codegouvfr/react-dsfr/Notice'

export type EtatInscriptionUtilisateur = {
  role: SessionUser['role']
  inscriptionValidee: Date | string | null
  mediateur: { id: string } | null
  coordinateur: { id: string } | null
}

/**
 * Les deux façons dont une inscription peut rester impraticable, dites à qui
 * administre. Elles s'excluent, et ne se confondent pas :
 *
 * - **restée à la première étape** : ni validée, ni compte de rôle — l'utilisateur
 *   n'est jamais allé au bout, il faut le relancer ;
 * - **validée sans compte de rôle** : l'état fantôme de l'incident des comptes
 *   sans rôle. Le compte a dépassé la première étape mais ne peut rien faire dans
 *   la coop, et `getHomepage` le renvoie indéfiniment vers l'inscription. Le
 *   remède est le job `reset-inscriptions-sans-role`, pas une relance.
 *
 * Le second échappe à `isUserInscriptionEnCours`, qui ne regarde que
 * `inscriptionValidee` : c'est pourquoi il a sa propre condition.
 */
export const AvertissementsEtatInscription = ({
  user,
}: {
  user: EtatInscriptionUtilisateur
}) => {
  const sansCompteDeRole = !user.mediateur && !user.coordinateur
  const estUtilisateurStandard =
    user.role !== 'Admin' && user.role !== 'Support'

  const resteeALaPremiereEtape =
    isUserInscriptionEnCours(user) && sansCompteDeRole

  const valideeSansCompteDeRole =
    estUtilisateurStandard &&
    user.inscriptionValidee != null &&
    !hasInscriptionComplete(user)

  return (
    <>
      {resteeALaPremiereEtape && (
        <Notice
          className="fr-notice--warning fr-mb-8v"
          title="Inscription restée à la première étape"
        />
      )}
      {valideeSansCompteDeRole && (
        <Notice
          className="fr-notice--warning fr-mb-8v"
          title="Inscription validée sans compte de rôle — ce compte ne peut rien faire dans la coop et reboucle sur l’inscription"
        />
      )}
    </>
  )
}
