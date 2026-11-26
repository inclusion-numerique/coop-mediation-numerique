import type {
  EnvoyerLAvertissement,
  EnvoyerLAvisDEffacement,
  EnvoyerLaRelance,
  LireLesComptesARelancer,
  NoterLaRelance,
  UtilisateurId,
} from '@/features/utilisateurs/domain'
import type { Result } from '@/libraries/result'

export type SuppressionRefusee = { readonly _tag: string }

export type SupprimerLeCompte = (suppression: {
  readonly utilisateurId: UtilisateurId
  readonly maintenant: Date
}) => Promise<Result<unknown, SuppressionRefusee>>

export type RelancerLesInscritsInactifsPorts = {
  readonly lireLesComptesARelancer: LireLesComptesARelancer
  readonly envoyerLaRelance: EnvoyerLaRelance
  readonly envoyerLAvertissement: EnvoyerLAvertissement
  readonly envoyerLAvisDEffacement: EnvoyerLAvisDEffacement
  readonly supprimerLeCompte: SupprimerLeCompte
  readonly noterLaRelance: NoterLaRelance
}
