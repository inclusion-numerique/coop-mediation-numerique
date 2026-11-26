import { describe, expect, it } from 'vitest'
import { UtilisateurId } from '@/features/utilisateurs/domain'
import { failure, success } from '@/libraries/result'
import { deconnecterUnUtilisateur } from './deconnecter-un-utilisateur'

const utilisateurId = '0d1a1e7e-1f2b-4c3d-8e4f-5a6b7c8d9e0f'

const deconnecter = (existe: boolean, identifiant: string) =>
  deconnecterUnUtilisateur({
    compteExiste: async () => existe,
    fermerLesSessions: async () => 2,
  })({ utilisateurId: identifiant })

describe('déconnecter un utilisateur', () => {
  it('ferme les sessions d’un compte existant', async () => {
    expect(await deconnecter(true, utilisateurId)).toEqual(
      success({
        utilisateurId: UtilisateurId(utilisateurId),
        sessionsFermees: 2,
      }),
    )
  })

  it('signale un compte introuvable', async () => {
    expect(await deconnecter(false, utilisateurId)).toEqual(
      failure({ _tag: 'UtilisateurIntrouvable', utilisateurId }),
    )
  })

  it('signale un identifiant qui ne désigne aucun compte', async () => {
    expect(await deconnecter(true, 'pas-un-identifiant')).toEqual(
      failure({
        _tag: 'UtilisateurIntrouvable',
        utilisateurId: 'pas-un-identifiant',
      }),
    )
  })
})
