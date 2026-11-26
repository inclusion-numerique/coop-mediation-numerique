import type { Adhesion } from './adhesion'
import type { CoordinateurDeLEquipe } from './coordinateur-de-l-equipe'
import type { CoordinateurId } from './identifiants/coordinateur-id'
import type { MediateurId } from './identifiants/mediateur-id'
import type { Invitation } from './invitation/invitation'
import type { ReferenceInvitation } from './invitation/reference-invitation'

export type InvitationLue<Cle> = {
  readonly invitation: Invitation
  readonly cle: Cle
}

export type LireUneInvitation<Cle> = (
  reference: ReferenceInvitation,
) => Promise<InvitationLue<Cle> | null>

export type LireLeCoordinateur = (
  coordinateurId: CoordinateurId,
) => Promise<CoordinateurDeLEquipe | null>

export type LireLesAdhesionsDeLaPaire = (paire: {
  readonly mediateurId: MediateurId
  readonly coordinateurId: CoordinateurId
}) => Promise<readonly Adhesion[]>
