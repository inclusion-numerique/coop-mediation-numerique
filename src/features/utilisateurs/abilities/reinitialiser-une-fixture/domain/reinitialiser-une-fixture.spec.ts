import { describe, expect, it } from 'vitest'
import { NomAffiche, UtilisateurId } from '@/features/utilisateurs/domain'
import type { MarquageFixture } from './ports'
import { reinitialiserUneFixture } from './reinitialiser-une-fixture'

const utilisateurId = UtilisateurId('0d1a1e7e-1f2b-4c3d-8e4f-5a6b7c8d9e0f')
const nom = NomAffiche('Jeanne Martin')

const reinitialiserAvec = (marquage: MarquageFixture) =>
  reinitialiserUneFixture({
    lireLeMarquageFixture: async () => marquage,
    reinitialiser: async () => nom,
  })

const fixture: MarquageFixture = { persona: true, marqueCommeFixture: true }

describe('réinitialiser une fixture', () => {
  it('réinitialise un compte de démonstration et rend son nom', async () => {
    expect(
      await reinitialiserAvec(fixture)({
        utilisateurId,
        demonstration: 'mediateur',
      }),
    ).toEqual({ success: true, data: { utilisateurId, nom } })
  })

  it.each<{ cas: string; marquage: MarquageFixture }>([
    {
      cas: 'un compte réel',
      marquage: { persona: false, marqueCommeFixture: false },
    },
    {
      cas: 'un persona dont le compte n’est pas marqué comme fixture',
      marquage: { persona: true, marqueCommeFixture: false },
    },
    {
      cas: 'un compte marqué comme fixture qui n’est pas un persona',
      marquage: { persona: false, marqueCommeFixture: true },
    },
  ])('refuse de réinitialiser $cas', async ({ marquage }) => {
    expect(
      await reinitialiserAvec(marquage)({
        utilisateurId,
        demonstration: 'mediateur',
      }),
    ).toEqual({ success: false, error: { _tag: 'CompteNonFixture' } })
  })

  it('signale un identifiant qui ne désigne aucun compte', async () => {
    expect(
      await reinitialiserAvec(fixture)({
        utilisateurId: null,
        demonstration: 'mediateur',
      }),
    ).toEqual({ success: false, error: { _tag: 'UtilisateurIntrouvable' } })
  })
})
