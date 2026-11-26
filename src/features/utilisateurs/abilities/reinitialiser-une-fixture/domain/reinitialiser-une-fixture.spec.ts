import { describe, expect, it } from 'vitest'
import { NomAffiche } from '@/features/utilisateurs/domain'
import { reinitialiserUneFixture } from './reinitialiser-une-fixture'

const utilisateurId = '0d1a1e7e-1f2b-4c3d-8e4f-5a6b7c8d9e0f'

const nom = NomAffiche('Jeanne Martin')

describe('réinitialiser une fixture', () => {
  it('réinitialise un compte de démonstration et rend son nom', async () => {
    expect(
      await reinitialiserUneFixture({
        estUneFixture: async () => true,
        reinitialiser: async () => nom,
      })(utilisateurId, 'mediateur'),
    ).toEqual({ success: true, data: { nom } })
  })

  it('refuse de réinitialiser un compte réel', async () => {
    expect(
      await reinitialiserUneFixture({
        estUneFixture: async () => false,
        reinitialiser: async () => nom,
      })(utilisateurId, 'mediateur'),
    ).toEqual({ success: false, error: { _tag: 'CompteNonFixture' } })
  })
})
