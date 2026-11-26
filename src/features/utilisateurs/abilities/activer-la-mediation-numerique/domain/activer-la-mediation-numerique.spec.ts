import { describe, expect, it } from 'vitest'
import { activerLaMediationNumerique } from './activer-la-mediation-numerique'

type CompteLu = {
  readonly id: string
  readonly mediateur: { readonly id: string } | null
  readonly coordinateur: { readonly id: string } | null
}

const utilisateurId = '0d1a1e7e-1f2b-4c3d-8e4f-5a6b7c8d9e0f'
const coordinateur = { id: '1a2b3c4d-5e6f-4708-8192-a3b4c5d6e7f8' }
const mediateur = { id: '2b3c4d5e-6f70-4819-92a3-b4c5d6e7f809' }

const activerPour = (compte: CompteLu | null) =>
  activerLaMediationNumerique({
    lireLeCompteQuiActive: async () => compte,
    activer: async () => undefined,
    inscrireALaListeDeDiffusion: async () => undefined,
  })(utilisateurId)

describe('activer la médiation numérique', () => {
  it('ajoute le rôle médiateur à un coordinateur', async () => {
    expect(
      await activerPour({ id: utilisateurId, mediateur: null, coordinateur }),
    ).toEqual({ success: true, data: 'AActiver' })
  })

  it('ne refait rien si la médiation est déjà active', async () => {
    expect(
      await activerPour({ id: utilisateurId, mediateur, coordinateur }),
    ).toEqual({ success: true, data: 'DejaActivee' })
  })

  it('est réservée aux coordinateurs', async () => {
    expect(
      await activerPour({ id: utilisateurId, mediateur, coordinateur: null }),
    ).toEqual({ success: false, error: { _tag: 'NonCoordinateur' } })
  })

  it('signale un utilisateur introuvable', async () => {
    expect(await activerPour(null)).toEqual({
      success: false,
      error: { _tag: 'UtilisateurIntrouvable', utilisateurId },
    })
  })
})
