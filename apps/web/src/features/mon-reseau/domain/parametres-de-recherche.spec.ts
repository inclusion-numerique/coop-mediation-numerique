import { communesLues, premiereValeur } from './parametres-de-recherche'

describe('paramètres de recherche de l’URL', () => {
  it('lit les communes d’un paramètre unique, séparées par des virgules', () => {
    expect(communesLues('15014,15187')).toEqual(['15014', '15187'])
  })

  it('lit les communes d’un paramètre répété', () => {
    expect(communesLues(['15014', '15187,abc'])).toEqual(['15014', '15187'])
  })

  it('n’a aucune commune sans paramètre', () => {
    expect(communesLues(undefined)).toEqual([])
  })

  it('retient la première valeur d’un paramètre répété', () => {
    expect(premiereValeur(['martin', 'durand'])).toBe('martin')
  })
})
