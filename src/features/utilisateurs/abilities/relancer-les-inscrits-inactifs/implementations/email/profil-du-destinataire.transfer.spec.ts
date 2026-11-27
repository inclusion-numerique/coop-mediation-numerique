import { describe, expect, it } from 'vitest'
import type { ProfilDuDestinataire } from '@/features/utilisateurs/domain'
import { profilDuCourriel } from './profil-du-destinataire.transfer'

describe('profil du destinataire dans le courriel', () => {
  it.each<{
    profil: ProfilDuDestinataire
    isMediateur: boolean
    isCoordinateur: boolean
  }>([
    { profil: { _tag: 'SansRole' }, isMediateur: false, isCoordinateur: false },
    { profil: { _tag: 'Mediateur' }, isMediateur: true, isCoordinateur: false },
    {
      profil: { _tag: 'Coordinateur' },
      isMediateur: false,
      isCoordinateur: true,
    },
    {
      profil: { _tag: 'MediateurEtCoordinateur' },
      isMediateur: true,
      isCoordinateur: true,
    },
  ])('traduit $profil._tag', ({ profil, isMediateur, isCoordinateur }) => {
    expect(profilDuCourriel(profil)).toEqual({ isMediateur, isCoordinateur })
  })
})
