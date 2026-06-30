import { CommuneResidence } from './commune-residence'

describe('CommuneResidence', () => {
  it('builds a complete commune', () => {
    expect(
      CommuneResidence({
        commune: 'Paris',
        codePostal: '75001',
        codeInsee: '75101',
        adresse: '12 rue de la Paix',
      }),
    ).toEqual({
      commune: 'Paris',
      codePostal: '75001',
      codeInsee: '75101',
      adresse: '12 rue de la Paix',
    })
  })

  it('omits an absent adresse', () => {
    expect(
      CommuneResidence({
        commune: 'Lyon',
        codePostal: '69001',
        codeInsee: '69381',
      }),
    ).toEqual({ commune: 'Lyon', codePostal: '69001', codeInsee: '69381' })
  })

  it('strips spaces from code postal and code insee', () => {
    expect(
      CommuneResidence({
        commune: 'Paris',
        codePostal: '75 001',
        codeInsee: '7 5101',
      }),
    ).toEqual({ commune: 'Paris', codePostal: '75001', codeInsee: '75101' })
  })

  it('rejects an incomplete commune', () => {
    expect(() =>
      CommuneResidence({
        commune: 'Paris',
        codePostal: '75001',
        codeInsee: '',
      }),
    ).toThrow()
  })
})
