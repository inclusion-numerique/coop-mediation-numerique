import type {
  AdresseCourriel,
  CompteARelancer,
  DestinataireDeRelance,
  PalierDeRelance,
  Relance,
  UtilisateurId,
} from '@/features/utilisateurs/domain'

type NoterLaRelance = (
  utilisateurId: UtilisateurId,
  relance: Relance,
  suppressionAnnoncee: Date | null,
) => Promise<void>

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
  readonly lireLesComptesARelancer: () => Promise<readonly CompteARelancer[]>
  readonly noterLaRelance: NoterLaRelance
}
