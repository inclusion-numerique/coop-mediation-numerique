import type { Result } from '@/libraries/result'
import type { EchecTechnique } from './errors'
import type { UtilisateurId } from './identifiants/utilisateur-id'
import type {
  CompteARelancer,
  DestinataireDeRelance,
} from './relances/destinataire-de-relance'
import type { PalierDeRelance, Relance } from './relances/relance'

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
