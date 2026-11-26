import type { ReferenceInvitation, UtilisateurId } from '../../../domain'

export type Annulation = {
  readonly reference: ReferenceInvitation
  readonly auteurId: UtilisateurId
}
