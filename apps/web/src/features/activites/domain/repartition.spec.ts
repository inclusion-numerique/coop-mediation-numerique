import { repartitionComplete } from './repartition'

describe('répartition', () => {
  it('associe chaque valeur à son nombre, dans l’ordre des valeurs', () => {
    expect(repartitionComplete(['a', 'b'], [3, 5])).toEqual([
      { valeur: 'a', nombre: 3 },
      { valeur: 'b', nombre: 5 },
    ])
  })

  it('compte zéro pour une valeur absente', () => {
    expect(repartitionComplete(['a', 'b'], [3])).toEqual([
      { valeur: 'a', nombre: 3 },
      { valeur: 'b', nombre: 0 },
    ])
  })
})
