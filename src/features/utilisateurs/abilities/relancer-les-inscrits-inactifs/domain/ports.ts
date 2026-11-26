import type {
  EnvoyerLAvertissement,
  EnvoyerLAvisDEffacement,
  EnvoyerLaRelance,
  LireLesComptesARelancer,
  NoterLaRelance,
  UtilisateurId,
} from '@/features/utilisateurs/domain'
import type { Result } from '@/libraries/result'

export type CompteSupprime = { readonly id: UtilisateurId }

export type SuppressionRefusee = {
  readonly _tag:
    | 'CompteIntrouvable'
    | 'CompteDejaSupprime'
    | 'RoleProtege'
    | 'SuppressionReserveeAuDispositif'
    | 'AccesNonCoupe'
}

export type SupprimerLeCompte = (suppression: {
  readonly utilisateurId: UtilisateurId
  readonly maintenant: Date
}) => Promise<Result<CompteSupprime, SuppressionRefusee>>

export type RelancerLesInscritsInactifsPorts = {
  readonly lireLesComptesARelancer: LireLesComptesARelancer
  readonly envoyerLaRelance: EnvoyerLaRelance
  readonly envoyerLAvertissement: EnvoyerLAvertissement
  readonly envoyerLAvisDEffacement: EnvoyerLAvisDEffacement
  readonly supprimerLeCompte: SupprimerLeCompte
  readonly noterLaRelance: NoterLaRelance
}
