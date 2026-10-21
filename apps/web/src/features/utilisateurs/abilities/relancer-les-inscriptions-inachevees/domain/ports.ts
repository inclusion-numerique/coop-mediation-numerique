import type {
  AdresseCourriel,
  DestinataireDeRelance,
  PalierDeRelance,
  UtilisateurId,
} from '@app/web/features/utilisateurs/domain'

export type RelancerLesInscriptionsInacheveesPorts = {
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
  readonly effacerLInscription: (utilisateurId: UtilisateurId) => Promise<void>
  readonly retirerDesListes: (courriel: AdresseCourriel) => Promise<void>
}
