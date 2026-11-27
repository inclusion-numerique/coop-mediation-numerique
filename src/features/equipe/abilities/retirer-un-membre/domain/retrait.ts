import type { AdhesionArchivee, UtilisateurId } from '../../../domain'

export type Retrait = {
  readonly adhesion: AdhesionArchivee
  readonly auteurId: UtilisateurId
}
