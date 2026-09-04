import { identifiantsCoop, lieuxCoopReunis } from './identifiant-composite'

describe('identifiants coop portés par un identifiant composite', () => {
  it('lit l’identifiant d’un lieu que seule la coop décrit', () => {
    expect(identifiantsCoop('Coop-numérique_abc')).toEqual(['abc'])
  })

  it('lit les identifiants coop d’un lieu que plusieurs sources décrivent', () => {
    expect(
      identifiantsCoop(
        'Hinaura_Fablab__Coop-numérique_abc__Coop-numérique_def',
      ),
    ).toEqual(['abc', 'def'])
  })

  it('ignore les tokens des autres sources', () => {
    expect(identifiantsCoop('Hinaura_Fablab__Res-in_1234')).toEqual([])
  })

  it('ne compte qu’une fois un identifiant répété', () => {
    expect(identifiantsCoop('Coop-numérique_abc__Coop-numérique_abc')).toEqual([
      'abc',
    ])
  })
})

describe('lieux carto réunis', () => {
  const lieu = { source: 'Coop numérique', dateMaj: null }

  it('écarte les lieux qu’aucun token coop ne désigne', () => {
    expect(
      lieuxCoopReunis([
        { ...lieu, identifiantCartographie: 'Hinaura_Fablab' },
        { ...lieu, identifiantCartographie: 'Coop-numérique_abc' },
      ]),
    ).toEqual([
      {
        ...lieu,
        identifiantCartographie: 'Coop-numérique_abc',
        coopIds: ['abc'],
      },
    ])
  })
})
