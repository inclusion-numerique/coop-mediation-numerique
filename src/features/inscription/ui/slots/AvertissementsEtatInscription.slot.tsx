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
