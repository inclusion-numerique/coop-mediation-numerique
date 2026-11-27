import { describe, expect, it } from 'vitest'
import { Siret } from '@/libraries/insee'
import { IdentiteEmployeuse } from '../../../domain/identite-employeuse'
import type { EmployeuseChoisie } from './renseigner-structure-employeuse.validation'
import { identiteSaisie } from './saisie-employeuse.transfer'

const choisie: EmployeuseChoisie = {
  siret: Siret('93429789600011'),
  nom: 'Employeuse choisie',
  adresse: '10 rue de la Bascule',
  commune: 'Nantes',
  codePostal: '44000',
  codeInsee: '44109',
  source: 'api',
}

describe('identité de l’employeuse choisie', () => {
  it('reprend les codes fournis par la recherche', () => {
    expect(identiteSaisie(choisie)).toEqual(
      IdentiteEmployeuse({
        siret: '93429789600011',
        denomination: 'Employeuse choisie',
        adresse: {
          voie: '10 rue de la Bascule',
          commune: 'Nantes',
          codePostal: '44000',
          codeInsee: '44109',
        },
      }),
    )
  })

  it('traduit les codes vides de la recherche en codes absents', () => {
    expect(
      identiteSaisie({ ...choisie, codePostal: '', codeInsee: '' }),
    ).toEqual(
      IdentiteEmployeuse({
        siret: '93429789600011',
        denomination: 'Employeuse choisie',
        adresse: {
          voie: '10 rue de la Bascule',
          commune: 'Nantes',
          codePostal: null,
          codeInsee: null,
        },
      }),
    )
  })

  it('n’en tire aucune identité sans commune', () => {
    expect(identiteSaisie({ ...choisie, commune: '' })).toBeNull()
  })
})
