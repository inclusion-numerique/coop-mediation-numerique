import type {
  CoordinateurId,
  Courriel,
  EnvoyerUneInvitation,
  LireLeCoordinateur,
} from '../../../domain'
import type { EnregistrementDesInvitations } from './invitations-envoyees'
import type { Existant } from './planifier'

export type LireLExistant<Cles> = (lecture: {
  readonly coordinateurId: CoordinateurId
  readonly candidats: readonly Courriel[]
}) => Promise<{ readonly existant: Existant; readonly cles: Cles }>

export type EnregistrerLesInvitations<Cles> = (
  enregistrement: EnregistrementDesInvitations & { readonly cles: Cles },
) => Promise<void>

export type InviterDesMembresPorts<Cles> = {
  readonly lireLeCoordinateur: LireLeCoordinateur
  readonly lireLExistant: LireLExistant<Cles>
  readonly enregistrerLesInvitations: EnregistrerLesInvitations<Cles>
  readonly envoyerUneInvitation: EnvoyerUneInvitation
}
