import type {
  EnvoyerUneInvitation,
  LireLeCoordinateur,
  LireUneInvitation,
} from '../../../domain'
import type { Relance } from './relance'

export type EnregistrerLaRelance<Cle> = (
  enregistrement: Relance & { readonly cle: Cle },
) => Promise<void>

export type RelancerUneInvitationPorts<Cle> = {
  readonly lireUneInvitation: LireUneInvitation<Cle>
  readonly lireLeCoordinateur: LireLeCoordinateur
  readonly envoyerUneInvitation: EnvoyerUneInvitation
  readonly enregistrerLaRelance: EnregistrerLaRelance<Cle>
}
