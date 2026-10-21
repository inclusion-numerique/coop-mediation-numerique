import type {
  ProprietairePartage,
  UtilisateurId,
} from '@app/web/features/mediateurs/domain'

export type PartageResolu = {
  readonly proprietaire: ProprietairePartage
  readonly utilisateurId: UtilisateurId
}
