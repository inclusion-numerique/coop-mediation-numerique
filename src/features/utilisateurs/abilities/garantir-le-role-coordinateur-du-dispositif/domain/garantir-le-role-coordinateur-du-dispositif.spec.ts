import { describe, expect, it } from 'vitest'
import { UtilisateurId } from '@/features/utilisateurs/domain'
import { success } from '@/libraries/result'
import { garantirLeRoleCoordinateurDuDispositif } from './garantir-le-role-coordinateur-du-dispositif'

const utilisateurId = UtilisateurId('0d1a1e7e-1f2b-4c3d-8e4f-5a6b7c8d9e0f')

const garantir = (aLeRole: boolean, coordonne: boolean) =>
  garantirLeRoleCoordinateurDuDispositif({
    aLeRoleCoordinateur: async () => aLeRole,
    coordonneDansLeDispositif: async () => coordonne,
    creerLeRoleCoordinateur: async () => undefined,
  })({ utilisateurId })

describe('garantir le rôle coordinateur du dispositif', () => {
  it('crée le rôle d’un coordinateur du dispositif qui ne l’a pas encore', async () => {
    expect(await garantir(false, true)).toEqual(
      success({ _tag: 'RoleCree', utilisateurId }),
    )
  })

  it('ne recrée pas le rôle d’un compte qui l’a déjà', async () => {
    expect(await garantir(true, true)).toEqual(
      success({ _tag: 'DejaCoordinateur' }),
    )
  })

  it('ne crée rien pour qui ne coordonne pas dans le dispositif', async () => {
    expect(await garantir(false, false)).toEqual(
      success({ _tag: 'HorsDuDispositif' }),
    )
  })
})
