import type {
  DestinataireDeRelance,
  EnvoyerLAvertissement,
  EnvoyerLAvisDEffacement,
  LireLesComptesARelancer,
  NoterLaRelance,
  SupprimerLeCompte,
} from '@/features/utilisateurs/domain'
import type { EchecTechnique, Result } from '@/libraries/result'
import type { BienDemarrer, RelanceDuCompte } from './relance-du-nouvel-inscrit'

export type EnvoyerBienDemarrer = (
  destinataire: DestinataireDeRelance,
  relance: BienDemarrer,
) => Promise<Result<void, EchecTechnique>>

export type EnvoyerLaRelanceDuCompte = (
  destinataire: DestinataireDeRelance,
  relance: RelanceDuCompte,
) => Promise<Result<void, EchecTechnique>>

export type RelancerLesInscritsInactifsPorts = {
  readonly lireLesComptesARelancer: LireLesComptesARelancer
  readonly envoyerBienDemarrer: EnvoyerBienDemarrer
  readonly envoyerLaRelanceDuCompte: EnvoyerLaRelanceDuCompte
  readonly envoyerLAvertissement: EnvoyerLAvertissement
  readonly envoyerLAvisDEffacement: EnvoyerLAvisDEffacement
  readonly supprimerLeCompte: SupprimerLeCompte
  readonly noterLaRelance: NoterLaRelance
}
