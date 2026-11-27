import type { Result } from '@/libraries/result'
import type { Adhesion } from './adhesion'
import type { CoordinateurDeLEquipe } from './coordinateur-de-l-equipe'
import type { EnvoiEchoue } from './errors'
import type { CoordinateurId } from './identifiants/coordinateur-id'
import type { MediateurId } from './identifiants/mediateur-id'
import type { EnvoiDInvitation } from './invitation/envoi-d-invitation'
import type { Invitation } from './invitation/invitation'
import type { Prevenance } from './invitation/prevenance'
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

export type EnvoyerUneInvitation = (
  envoi: EnvoiDInvitation,
) => Promise<Result<void, EnvoiEchoue>>

export type PrevenirLeCoordinateur = (prevenance: Prevenance) => Promise<void>
