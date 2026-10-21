import type {
  DestinataireDeRelance,
  PalierDeRelance,
  UtilisateurId,
} from '@app/web/features/utilisateurs/domain'

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
  readonly supprimerLeCompte: (utilisateurId: UtilisateurId) => Promise<void>
}
