import type {
  ProprietairePartage,
  UtilisateurId,
} from '@/features/mediateurs/domain'

export type PartageResolu = {
  readonly proprietaire: ProprietairePartage
  readonly utilisateurId: UtilisateurId
}
