import { describe, expect, it } from 'vitest'
import {
  invitationAcceptee,
  invitationEnAttente,
  invitationRefusee,
} from '../fixtures/domaine'
import { exigerEnAttente, exigerUneRelancePossible } from './invitation'

describe('une invitation ne se traite qu’une fois', () => {
  it('une invitation en attente peut encore l’être', () => {
    expect(exigerEnAttente(invitationEnAttente)).toEqual({
      success: true,
      data: invitationEnAttente,
    })
  })

  it.each([
    [invitationAcceptee, 'Acceptee'],
    [invitationRefusee, 'Refusee'],
  ])('une invitation déjà traitée ne le peut plus', (invitation, statut) => {
    expect(exigerEnAttente(invitation)).toEqual({
      success: false,
      error: expect.objectContaining({ _tag: 'InvitationDejaTraitee', statut }),
    })
  })
})

describe('une invitation ne se relance qu’une heure après son dernier envoi', () => {
  it('une heure après l’envoi, elle se relance', () => {
    expect(
      exigerUneRelancePossible(
        invitationEnAttente,
        new Date('2026-01-01T10:00:00Z'),
      ).success,
    ).toBe(true)
  })

  it('moins d’une heure après l’envoi, elle ne se relance pas', () => {
    expect(
      exigerUneRelancePossible(
        invitationEnAttente,
        new Date('2026-01-01T09:59:00Z'),
      ),
    ).toEqual({ success: false, error: { _tag: 'RelanceTropRecente' } })
  })

  it('moins d’une heure après une relance, elle ne se relance pas', () => {
    expect(
      exigerUneRelancePossible(
        {
          ...invitationEnAttente,
          renvoyeeLe: new Date('2026-01-05T09:00:00Z'),
        },
        new Date('2026-01-05T09:30:00Z'),
      ).success,
    ).toBe(false)
  })
})
