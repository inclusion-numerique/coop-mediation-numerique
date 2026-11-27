import type { EchecTechnique, Result } from '@/libraries/result'
import type { EchecDeRelance, SuppressionRefusee } from './errors'
import type { AuteurId } from './identifiants/auteur-id'
import type { UtilisateurId } from './identifiants/utilisateur-id'
import type {
  CompteARelancer,
  DestinataireDeRelance,
} from './relances/destinataire-de-relance'
import type { PalierDeRelance, Relance } from './relances/relance'
import type {
  CompteAReaffecter,
  PlanDeChangement,
} from './roles/plan-de-changement'

export type LireLesComptesARelancer = () => Promise<readonly CompteARelancer[]>

export type EnvoyerLaRelance = (
  destinataire: DestinataireDeRelance,
  palier: PalierDeRelance,
) => Promise<Result<void, EchecTechnique>>

export type EnvoyerLAvertissement = (
  destinataire: DestinataireDeRelance,
  echeance: { readonly suppressionLe: Date; readonly joursRestants: number },
) => Promise<Result<void, EchecTechnique>>

export type EnvoyerLAvisDEffacement = (
  destinataire: DestinataireDeRelance,
) => Promise<Result<void, EchecTechnique>>

export type NoterLaRelance = (
  utilisateurId: UtilisateurId,
  relance: Relance,
  suppressionAnnoncee: Date | null,
) => Promise<Result<void, EchecTechnique>>

export type EffacerLeDestinataire = (
  destinataire: DestinataireDeRelance,
) => Promise<Result<void, EchecDeRelance>>

export type PortsDeRelance = {
  readonly relancer: EnvoyerLaRelance
  readonly avertir: EnvoyerLAvertissement
  readonly effacer: EffacerLeDestinataire
  readonly noter: NoterLaRelance
}

export type SupprimerLeCompte = (suppression: {
  readonly utilisateurId: UtilisateurId
  readonly maintenant: Date
}) => Promise<Result<{ readonly id: UtilisateurId }, SuppressionRefusee>>

export type LireLeCompteAReaffecter = (
  utilisateurId: UtilisateurId,
) => Promise<CompteAReaffecter | null>

export type AppliquerLePlan = (
  utilisateurId: UtilisateurId,
  plan: PlanDeChangement,
) => Promise<void>

export type JournaliserLeChangement = (changement: {
  readonly utilisateurId: UtilisateurId
  readonly auteurId: AuteurId | null
  readonly plan: PlanDeChangement
}) => void
