import type {
  EnvoyerLAvertissement,
  EnvoyerLAvisDEffacement,
  EnvoyerLaRelance,
  LireLesComptesARelancer,
  NoterLaRelance,
  PortsDuRetraitDuContact,
  UtilisateurId,
} from '@/features/utilisateurs/domain'
import type { EchecTechnique, Result } from '@/libraries/result'

export type EffacerLInscription = (
  utilisateurId: UtilisateurId,
) => Promise<Result<void, EchecTechnique>>

export type RelancerLesInscriptionsInacheveesPorts = PortsDuRetraitDuContact & {
  readonly lireLesComptesARelancer: LireLesComptesARelancer
  readonly envoyerLaRelance: EnvoyerLaRelance
  readonly envoyerLAvertissement: EnvoyerLAvertissement
  readonly envoyerLAvisDEffacement: EnvoyerLAvisDEffacement
  readonly effacerLInscription: EffacerLInscription
  readonly noterLaRelance: NoterLaRelance
}
