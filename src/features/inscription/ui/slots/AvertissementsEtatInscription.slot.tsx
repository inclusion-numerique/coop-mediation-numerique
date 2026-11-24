import Notice from '@codegouvfr/react-dsfr/Notice'
import {
  inscriptionEnCours,
  type RoleDuCompte,
} from '@/features/inscription/domain/inscription-en-cours'

export type EtatInscriptionUtilisateur = {
  role: RoleDuCompte
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
 *   la coop, et `pageDAccueil` le renvoie indéfiniment vers l'inscription. Le
 *   remède fut une reprise en base, jouée le 08/07/2026, pas une relance.
 *
 * Le second échappe à `inscriptionEnCours`, qui ne regarde que
 * `inscriptionValidee` : c'est pourquoi il a sa propre condition.
 */
export const AvertissementsEtatInscription = ({
  user,
}: {
  user: EtatInscriptionUtilisateur
}) => {
  const sansCompteDeRole = !user.mediateur && !user.coordinateur
  const estUtilisateurStandard = user.role !== 'Admin'

  const resteeALaPremiereEtape = inscriptionEnCours(user) && sansCompteDeRole

  const valideeSansCompteDeRole =
    estUtilisateurStandard &&
    user.inscriptionValidee != null &&
    sansCompteDeRole

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
