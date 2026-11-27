import type {
  LireLeCoordinateur,
  LireUneInvitation,
  PrevenirLeCoordinateur,
} from '../../../domain'
import type { Refus } from './refus'

export type EnregistrerLeRefus<Cle> = (
  enregistrement: Refus & { readonly cle: Cle },
) => Promise<void>

export type RefuserUneInvitationPorts<Cle> = {
  readonly lireUneInvitation: LireUneInvitation<Cle>
  readonly enregistrerLeRefus: EnregistrerLeRefus<Cle>
  readonly lireLeCoordinateur: LireLeCoordinateur
  readonly prevenirLeCoordinateur: PrevenirLeCoordinateur
}
