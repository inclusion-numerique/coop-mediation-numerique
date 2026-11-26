import type {
  CoordinateurId,
  LireLeCoordinateur,
  LireUneInvitation,
} from '../../../domain'

export type CompterLesMembresActifs = (
  coordinateurId: CoordinateurId,
) => Promise<number>

export type ConsulterUneInvitationPorts<Cle> = {
  readonly lireUneInvitation: LireUneInvitation<Cle>
  readonly lireLeCoordinateur: LireLeCoordinateur
  readonly compterLesMembresActifs: CompterLesMembresActifs
}
