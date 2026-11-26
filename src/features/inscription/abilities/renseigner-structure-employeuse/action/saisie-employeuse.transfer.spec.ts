import { describe, expect, it } from 'vitest'
import { saisieEmployeuse } from './saisie-employeuse.transfer'

describe('saisie de la structure employeuse', () => {
  it('reprend le SIRET, le nom et l’adresse saisis', () => {
    expect(
      saisieEmployeuse({
        siret: '13002526500013',
        nom: 'Association du numérique',
        adresse: '4 rue de la Rue',
        commune: 'Lyon',
        codePostal: '69001',
        codeInsee: '69381',
      }),
    ).toEqual({
      siret: '13002526500013',
      denomination: 'Association du numérique',
      adresse: {
        voie: '4 rue de la Rue',
        commune: 'Lyon',
        codePostal: '69001',
        codeInsee: '69381',
      },
    })
  })

  it('traduit les champs laissés vides en absences', () => {
    expect(
      saisieEmployeuse({
        siret: '13002526500013',
        nom: '',
        adresse: '4 rue de la Rue',
        commune: 'Lyon',
        codePostal: '',
        codeInsee: '',
      }),
    ).toEqual({
      siret: '13002526500013',
      denomination: null,
      adresse: {
        voie: '4 rue de la Rue',
        commune: 'Lyon',
        codePostal: null,
        codeInsee: null,
      },
    })
  })
})
