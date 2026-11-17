import { Siret } from '@app/web/libraries/insee'
import { describe, expect, it } from 'vitest'
import {
  type EmployeuseChoisie,
  identiteDeLEmployeuseChoisie,
} from './employeuse-choisie'

const choisie = (
  champs: Partial<EmployeuseChoisie> = {},
): EmployeuseChoisie => ({
  siret: Siret('93429789600011'),
  nom: 'Employeuse choisie',
  adresse: '10 rue de la Bascule',
  commune: 'Nantes',
  codePostal: '44000',
  codeInsee: '44109',
  source: 'api',
  ...champs,
})

describe('identité de l’employeuse choisie', () => {
  it('reprend le SIRET, le nom et l’adresse saisis', () => {
    expect(identiteDeLEmployeuseChoisie(choisie())).toEqual({
      siret: '93429789600011',
      denomination: 'Employeuse choisie',
      adresse: {
        voie: '10 rue de la Bascule',
        commune: 'Nantes',
        codePostal: '44000',
        codeInsee: '44109',
      },
    })
  })

  it('laisse vides les codes que la saisie n’a pas fournis', () => {
    expect(
      identiteDeLEmployeuseChoisie(choisie({ codePostal: '', codeInsee: '' }))
        ?.adresse,
    ).toEqual({
      voie: '10 rue de la Bascule',
      commune: 'Nantes',
      codePostal: null,
      codeInsee: null,
    })
  })

  it('n’en fait pas une employeuse sans commune', () => {
    expect(identiteDeLEmployeuseChoisie(choisie({ commune: '' }))).toBeNull()
  })
})
