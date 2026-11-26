import { describe, expect, it } from 'vitest'
import { Siret } from '@/libraries/insee'
import { saisieEmployeuse } from './saisie-employeuse.transfer'

describe('saisie de l’employeuse choisie', () => {
  it('traduit les codes vides de la recherche en codes absents', () => {
    expect(
      saisieEmployeuse({
        siret: Siret('93429789600011'),
        nom: 'Employeuse choisie',
        adresse: '10 rue de la Bascule',
        commune: 'Nantes',
        codePostal: '',
        codeInsee: '',
        source: 'api',
      }),
    ).toEqual({
      siret: '93429789600011',
      denomination: 'Employeuse choisie',
      adresse: {
        voie: '10 rue de la Bascule',
        commune: 'Nantes',
        codePostal: null,
        codeInsee: null,
      },
    })
  })

  it('reprend les codes fournis par la recherche', () => {
    expect(
      saisieEmployeuse({
        siret: Siret('93429789600011'),
        nom: 'Employeuse choisie',
        adresse: '10 rue de la Bascule',
        commune: 'Nantes',
        codePostal: '44000',
        codeInsee: '44109',
        source: 'api',
      }).adresse,
    ).toEqual({
      voie: '10 rue de la Bascule',
      commune: 'Nantes',
      codePostal: '44000',
      codeInsee: '44109',
    })
  })
})
