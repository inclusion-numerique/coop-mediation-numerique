import { describe, expect, it } from 'vitest'
import { Courriel } from '../../../domain'
import { type CoordinateurDeLEquipe } from '../../../domain/coordinateur-de-l-equipe'
import { CoordinateurId } from '../../../domain/identifiants/coordinateur-id'
import { NomAffiche } from '../../../domain/identite/nom-affiche'
import {
  type InvitationEnAttente,
  type InvitationRefusee,
} from '../../../domain/invitation/invitation'
import { ReferenceInvitation } from '../../../domain/invitation/reference-invitation'
import { vueInvitation } from './vue-invitation'

const coordinateurId = CoordinateurId('550e8400-e29b-41d4-a716-446655440001')

const email = Courriel('invite@example.com')

const reference = ReferenceInvitation({ email, coordinateurId })

const invitationEnAttente: InvitationEnAttente = {
  reference,
  invite: { type: 'SansCompte' },
  envoyeeLe: new Date('2026-01-01T09:00:00Z'),
  renvoyeeLe: null,
  statut: 'EnAttente',
}

const invitationRefusee: InvitationRefusee = {
  ...invitationEnAttente,
  statut: 'Refusee',
  refuseeLe: new Date('2026-01-03T09:00:00Z'),
}

const coordinateurDeLEquipe: CoordinateurDeLEquipe = {
  nom: NomAffiche('Camille Coordinatrice'),
  email: Courriel('camille@example.com'),
  telephone: null,
}

const coordinateur = coordinateurDeLEquipe

describe('ce que voit une personne qui ouvre son invitation', () => {
  it('l’invitation en attente, connectée avec la bonne adresse', () => {
    expect(
      vueInvitation({
        invitation: invitationEnAttente,
        session: email,
        coordinateur,
        tailleEquipe: 3,
      }),
    ).toEqual({
      type: 'EnAttente',
      reference: invitationEnAttente.reference,
      coordinateur,
      tailleEquipe: 3,
      connecte: true,
    })
  })

  it('l’invitation en attente, sans être connectée', () => {
    expect(
      vueInvitation({
        invitation: invitationEnAttente,
        session: null,
        coordinateur,
        tailleEquipe: 3,
      }),
    ).toEqual(expect.objectContaining({ type: 'EnAttente', connecte: false }))
  })

  it('un avertissement quand elle est connectée avec une autre adresse', () => {
    expect(
      vueInvitation({
        invitation: invitationEnAttente,
        session: Courriel('autre@example.com'),
        coordinateur,
        tailleEquipe: 3,
      }),
    ).toEqual({ type: 'MauvaisDestinataire' })
  })

  it('une invitation déjà traitée', () => {
    expect(
      vueInvitation({
        invitation: invitationRefusee,
        session: null,
        coordinateur,
        tailleEquipe: 3,
      }),
    ).toEqual({ type: 'DejaTraitee' })
  })

  it('une invitation qui n’existe plus', () => {
    expect(
      vueInvitation({
        invitation: null,
        session: null,
        coordinateur,
        tailleEquipe: 0,
      }),
    ).toEqual({ type: 'DejaTraitee' })
  })
})
