import { voieDuRegistre } from './voie-du-registre'

describe('la voie, que l’Entrepôt éclate en trois colonnes', () => {
  it('recompose le numéro, la répétition et le nom', () => {
    expect(
      voieDuRegistre({
        numeroVoie: 12,
        repetition: 'bis',
        nomVoie: 'rue Foch',
      }),
    ).toBe('12 bis rue Foch')
  })

  it('saute ce que l’Entrepôt ne renseigne pas', () => {
    expect(
      voieDuRegistre({ numeroVoie: 12, repetition: null, nomVoie: 'rue Foch' }),
    ).toBe('12 rue Foch')
    expect(
      voieDuRegistre({
        numeroVoie: null,
        repetition: null,
        nomVoie: 'rue Foch',
      }),
    ).toBe('rue Foch')
  })

  it('saute aussi ce qu’il renseigne de blanc', () => {
    expect(
      voieDuRegistre({ numeroVoie: 12, repetition: '  ', nomVoie: 'rue Foch' }),
    ).toBe('12 rue Foch')
  })

  it('rend les jetons débarrassés de leurs espaces de bord', () => {
    expect(
      voieDuRegistre({
        numeroVoie: 12,
        repetition: ' bis ',
        nomVoie: '  rue Foch  ',
      }),
    ).toBe('12 bis rue Foch')
  })

  it('ne rend rien d’une adresse qui ne dit rien', () => {
    expect(
      voieDuRegistre({ numeroVoie: null, repetition: null, nomVoie: null }),
    ).toBe('')
  })

  it('garde un numéro à zéro, qui est une valeur', () => {
    expect(
      voieDuRegistre({ numeroVoie: 0, repetition: null, nomVoie: 'rue Foch' }),
    ).toBe('0 rue Foch')
  })
})
