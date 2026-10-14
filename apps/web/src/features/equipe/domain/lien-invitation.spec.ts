import { encodeSerializableState } from '@app/web/utils/encodeSerializableState'
import { CoordinateurId } from './coordinateur-id'
import { EmailInvitation } from './email-invitation'
import {
  codeInvitation,
  lienInvitation,
  referenceDuCode,
} from './lien-invitation'
import { ReferenceInvitation } from './reference-invitation'

const reference = ReferenceInvitation({
  email: EmailInvitation('Invite@Example.com'),
  coordinateurId: CoordinateurId('550e8400-e29b-41d4-a716-446655440001'),
})

describe('lien d’invitation', () => {
  it('mène à la page de l’invitation', () => {
    expect(lienInvitation(reference)).toBe(
      `/invitations/${codeInvitation(reference)}`,
    )
  })

  it('restitue la référence de l’invitation', () => {
    expect(referenceDuCode(codeInvitation(reference))).toEqual(reference)
  })

  it('ramène à sa forme canonique un email codé dans un ancien lien', () => {
    const ancienCode = encodeSerializableState<unknown>({
      email: 'Invite@Example.com',
      coordinateurId: '550e8400-e29b-41d4-a716-446655440001',
    })

    expect(referenceDuCode(ancienCode)?.email).toBe('invite@example.com')
  })

  it('ne restitue rien d’un code illisible', () => {
    expect(
      referenceDuCode(encodeSerializableState<unknown>({ email: 'x' })),
    ).toBeNull()
  })
})
