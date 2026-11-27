import type {
  LireLeCoordinateur,
  LireLesAdhesionsDeLaPaire,
  LireUneInvitation,
  PrevenirLeCoordinateur,
} from '../../../domain'
import type { Acceptation } from './acceptation'

export type EnregistrerLAcceptation<Cle> = (
  enregistrement: Acceptation & { readonly cle: Cle },
) => Promise<{ readonly adhesionEnregistree: boolean }>

export type AccepterUneInvitationPorts<Cle> = {
  readonly lireUneInvitation: LireUneInvitation<Cle>
  readonly lireLesAdhesionsDeLaPaire: LireLesAdhesionsDeLaPaire
  readonly enregistrerLAcceptation: EnregistrerLAcceptation<Cle>
  readonly lireLeCoordinateur: LireLeCoordinateur
  readonly prevenirLeCoordinateur: PrevenirLeCoordinateur
}
