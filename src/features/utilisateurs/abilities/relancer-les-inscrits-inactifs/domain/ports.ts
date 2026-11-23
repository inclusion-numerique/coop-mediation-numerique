import type {
  CompteARelancer,
  DestinataireDeRelance,
  EffacementImpossible,
  PalierDeRelance,
  Relance,
  UtilisateurId,
} from '@/features/utilisateurs/domain'

type NoterLaRelance = (
  utilisateurId: UtilisateurId,
  relance: Relance,
  suppressionAnnoncee: Date | null,
) => Promise<void>

import type { Result } from '@/libraries/result'

export type RelancerLesInscritsInactifsPorts = {
  readonly envoyerLaRelance: (
    destinataire: DestinataireDeRelance,
    palier: PalierDeRelance,
  ) => Promise<void>
  readonly envoyerLAvertissement: (
    destinataire: DestinataireDeRelance,
    echeance: { readonly suppressionLe: Date; readonly joursRestants: number },
  ) => Promise<void>
  readonly envoyerLAvisDEffacement: (
    destinataire: DestinataireDeRelance,
  ) => Promise<void>
  readonly supprimerLeCompte: (
    utilisateurId: UtilisateurId,
  ) => Promise<Result<void, EffacementImpossible>>
  readonly lireLesComptesARelancer: () => Promise<readonly CompteARelancer[]>
  readonly noterLaRelance: NoterLaRelance
}
