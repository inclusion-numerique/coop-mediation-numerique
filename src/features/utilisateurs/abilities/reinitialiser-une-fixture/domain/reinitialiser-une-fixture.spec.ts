import { describe, expect, it } from 'vitest'
import { NomAffiche, UtilisateurId } from '@/features/utilisateurs/domain'
import { reinitialiserUneFixture } from './reinitialiser-une-fixture'

const utilisateurId = UtilisateurId('0d1a1e7e-1f2b-4c3d-8e4f-5a6b7c8d9e0f')
const nom = NomAffiche('Jeanne Martin')

const reinitialiserAvec = (fixture: boolean) =>
  reinitialiserUneFixture({
    estUneFixture: async () => fixture,
    reinitialiser: async () => nom,
  })

describe('réinitialiser une fixture', () => {
  it('réinitialise un compte de démonstration et rend son nom', async () => {
    expect(
      await reinitialiserAvec(true)({
        utilisateurId,
        demonstration: 'mediateur',
      }),
    ).toEqual({ success: true, data: { utilisateurId, nom } })
  })

  it('refuse de réinitialiser un compte réel', async () => {
    expect(
      await reinitialiserAvec(false)({
        utilisateurId,
        demonstration: 'mediateur',
      }),
    ).toEqual({ success: false, error: { _tag: 'CompteNonFixture' } })
  })

  it('signale un identifiant qui ne désigne aucun compte', async () => {
    expect(
      await reinitialiserAvec(true)({
        utilisateurId: null,
        demonstration: 'mediateur',
      }),
    ).toEqual({ success: false, error: { _tag: 'UtilisateurIntrouvable' } })
  })
})
