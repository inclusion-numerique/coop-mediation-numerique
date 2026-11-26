import type { AdhesionArchivee, UtilisateurId } from '../../../domain'

export type Depart = {
  readonly adhesion: AdhesionArchivee
  readonly auteurId: UtilisateurId
}
