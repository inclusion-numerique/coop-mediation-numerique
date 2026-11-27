import type { LireUneInvitation } from '../../../domain'
import type { Annulation } from './annulation'

export type SupprimerLInvitation<Cle> = (
  suppression: Annulation & { readonly cle: Cle },
) => Promise<void>

export type AnnulerUneInvitationPorts<Cle> = {
  readonly lireUneInvitation: LireUneInvitation<Cle>
  readonly supprimerLInvitation: SupprimerLInvitation<Cle>
}
