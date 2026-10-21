import type { AdhesionActive, AdhesionArchivee } from './adhesion'
import { AdhesionId } from './adhesion-id'
import type { CoordinateurDeLEquipe } from './coordinateur-de-l-equipe'
import { CoordinateurId } from './coordinateur-id'
import { Email } from './email'
import type {
  InvitationAcceptee,
  InvitationEnAttente,
  InvitationRefusee,
} from './invitation'
import { MediateurId } from './mediateur-id'
import { NomAffiche } from './nom-affiche'
import { ReferenceInvitation } from './reference-invitation'

export const coordinateurId = CoordinateurId(
  '550e8400-e29b-41d4-a716-446655440001',
)
export const mediateurId = MediateurId('550e8400-e29b-41d4-a716-446655440011')
export const email = Email('invite@example.com')
export const reference = ReferenceInvitation({ email, coordinateurId })

export const invitationEnAttente: InvitationEnAttente = {
  reference,
  invite: { type: 'SansCompte' },
  envoyeeLe: new Date('2026-01-01T09:00:00Z'),
  renvoyeeLe: null,
  statut: 'EnAttente',
}

export const invitationAcceptee: InvitationAcceptee = {
  ...invitationEnAttente,
  invite: { type: 'MediateurInscrit', mediateurId },
  renvoyeeLe: new Date('2026-01-05T09:00:00Z'),
  statut: 'Acceptee',
  accepteeLe: new Date('2026-01-06T09:00:00Z'),
}

export const invitationRefusee: InvitationRefusee = {
  ...invitationEnAttente,
  statut: 'Refusee',
  refuseeLe: new Date('2026-01-03T09:00:00Z'),
}

export const adhesionActive: AdhesionActive = {
  id: AdhesionId('550e8400-e29b-41d4-a716-446655440021'),
  mediateurId,
  coordinateurId,
  depuis: new Date('2026-02-01T09:00:00Z'),
  statut: 'Active',
}

export const adhesionArchivee: AdhesionArchivee = {
  id: AdhesionId('550e8400-e29b-41d4-a716-446655440022'),
  mediateurId,
  coordinateurId,
  depuis: new Date('2025-02-01T09:00:00Z'),
  statut: 'Archivee',
  archiveeLe: new Date('2025-06-01T09:00:00Z'),
}

export const coordinateurDeLEquipe: CoordinateurDeLEquipe = {
  nom: NomAffiche('Camille Coordinatrice'),
  email: Email('camille@example.com'),
  telephone: null,
}
