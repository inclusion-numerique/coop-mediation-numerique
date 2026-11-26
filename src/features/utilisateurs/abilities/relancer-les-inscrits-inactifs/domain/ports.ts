import type {
  EnvoyerLAvertissement,
  EnvoyerLAvisDEffacement,
  EnvoyerLaRelance,
  LireLesComptesARelancer,
  NoterLaRelance,
  SupprimerLeCompte,
} from '@/features/utilisateurs/domain'

export type RelancerLesInscritsInactifsPorts = {
  readonly lireLesComptesARelancer: LireLesComptesARelancer
  readonly envoyerLaRelance: EnvoyerLaRelance
  readonly envoyerLAvertissement: EnvoyerLAvertissement
  readonly envoyerLAvisDEffacement: EnvoyerLAvisDEffacement
  readonly supprimerLeCompte: SupprimerLeCompte
  readonly noterLaRelance: NoterLaRelance
}
