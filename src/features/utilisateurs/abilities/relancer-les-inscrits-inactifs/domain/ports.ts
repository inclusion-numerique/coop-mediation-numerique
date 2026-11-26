import type {
  DestinataireDeRelance,
  EnvoyerLAvertissement,
  EnvoyerLAvisDEffacement,
  LireLesComptesARelancer,
  NoterLaRelance,
  SupprimerLeCompte,
} from '@/features/utilisateurs/domain'
import type { EchecTechnique, Result } from '@/libraries/result'
import type { RelanceDuNouvelInscrit } from './relance-du-nouvel-inscrit'

export type EnvoyerLaRelanceDuNouvelInscrit = (
  destinataire: DestinataireDeRelance,
  relance: RelanceDuNouvelInscrit,
) => Promise<Result<void, EchecTechnique>>

export type RelancerLesInscritsInactifsPorts = {
  readonly lireLesComptesARelancer: LireLesComptesARelancer
  readonly envoyerLaRelance: EnvoyerLaRelanceDuNouvelInscrit
  readonly envoyerLAvertissement: EnvoyerLAvertissement
  readonly envoyerLAvisDEffacement: EnvoyerLAvisDEffacement
  readonly supprimerLeCompte: SupprimerLeCompte
  readonly noterLaRelance: NoterLaRelance
}
