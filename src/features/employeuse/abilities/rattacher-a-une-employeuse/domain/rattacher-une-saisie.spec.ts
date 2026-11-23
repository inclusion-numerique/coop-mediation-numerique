import { describe, expect, it } from 'vitest'
import { EmployeuseId } from '../../../domain/employeuse-id'
import type { RattacherAUneEmployeuse } from './rattacher-a-une-employeuse'
import { rattacherUneSaisie } from './rattacher-une-saisie'

const rattacher: RattacherAUneEmployeuse = async () => ({
  _tag: 'rattachee',
  employeuseId: EmployeuseId(7),
})

const saisie = {
  siret: '93429789600011',
  denomination: 'Employeuse saisie',
  adresse: {
    voie: '10 rue de la Bascule',
    commune: 'Nantes',
    codePostal: '44000',
    codeInsee: '44109',
  },
}

describe('rattacher une employeuse saisie', () => {
  it('rattache une saisie qui fait une identité', async () => {
    expect(
      await rattacherUneSaisie(rattacher)({ userId: 'utilisateur', saisie }),
    ).toEqual({ _tag: 'rattachee', employeuseId: 7 })
  })

  it('refuse une saisie sans commune', async () => {
    expect(
      await rattacherUneSaisie(rattacher)({
        userId: 'utilisateur',
        saisie: { ...saisie, adresse: { ...saisie.adresse, commune: '' } },
      }),
    ).toEqual({ _tag: 'identiteInexploitable' })
  })
})
