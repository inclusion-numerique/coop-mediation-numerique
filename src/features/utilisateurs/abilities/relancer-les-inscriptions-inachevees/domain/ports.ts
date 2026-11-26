import type {
  AdresseCourriel,
  EnvoyerLAvertissement,
  EnvoyerLAvisDEffacement,
  EnvoyerLaRelance,
  LireLesComptesARelancer,
  NoterLaRelance,
  UtilisateurId,
} from '@/features/utilisateurs/domain'
import type { EchecTechnique, Result } from '@/libraries/result'

export type EffacerLInscription = (
  utilisateurId: UtilisateurId,
) => Promise<Result<void, EchecTechnique>>

export type RetirerDesListes = (
  courriel: AdresseCourriel,
) => Promise<Result<void, EchecTechnique>>

export type RelancerLesInscriptionsInacheveesPorts = {
  readonly lireLesComptesARelancer: LireLesComptesARelancer
  readonly envoyerLaRelance: EnvoyerLaRelance
  readonly envoyerLAvertissement: EnvoyerLAvertissement
  readonly envoyerLAvisDEffacement: EnvoyerLAvisDEffacement
  readonly effacerLInscription: EffacerLInscription
  readonly retirerDesListes: RetirerDesListes
  readonly noterLaRelance: NoterLaRelance
}
