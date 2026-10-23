import { sansLaValeur } from './etiquette-de-filtre'

describe('retrait d’une valeur de filtre', () => {
  it('retire la valeur et garde les autres', () => {
    expect(sansLaValeur('15014,15187', '15014')).toBe('15187')
  })

  it('ne laisse rien quand c’était la dernière valeur', () => {
    expect(sansLaValeur('coordinateur', 'coordinateur')).toBe('')
  })
})
