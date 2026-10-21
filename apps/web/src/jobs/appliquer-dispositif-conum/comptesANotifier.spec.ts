import { comptesANotifier } from './comptesANotifier'

const ids = (n: number, prefixe = 'u') =>
  Array.from({ length: n }, (_, i) => `${prefixe}${i}`)

describe('comptesANotifier', () => {
  it('nuit ordinaire : envoie à Brevo le contact entier des seuls comptes impactés', () => {
    expect(
      comptesANotifier({
        impactes: ['a', 'b'],
        avecContrat: [],
        importTermine: false,
        limite: 500,
        forcer: false,
      }),
    ).toEqual({ contactsComplets: ['a', 'b'], datesContrat: [], borne: false })
  })

  it('nuit ordinaire au-delà de la borne : n’envoie aucun contact à Brevo', () => {
    expect(
      comptesANotifier({
        impactes: ids(501),
        avecContrat: [],
        importTermine: false,
        limite: 500,
        forcer: false,
      }),
    ).toEqual({ contactsComplets: [], datesContrat: [], borne: true })
  })

  it('forcerBrevo passe outre la borne et envoie tous les comptes impactés', () => {
    const resultat = comptesANotifier({
      impactes: ids(501),
      avecContrat: [],
      importTermine: false,
      limite: 500,
      forcer: true,
    })
    expect(resultat.borne).toBe(false)
    expect(resultat.contactsComplets).toHaveLength(501)
  })

  it('après un import idposte : contact entier pour les impactés, dates seules pour les autres comptes avec contrat', () => {
    expect(
      comptesANotifier({
        impactes: ['a', 'b'],
        avecContrat: ['b', 'c'],
        importTermine: true,
        limite: 500,
        forcer: false,
      }),
    ).toEqual({
      contactsComplets: ['a', 'b'],
      datesContrat: ['c'],
      borne: false,
    })
  })

  it('après un import idposte : les dates de contrat partent pour tous, sans borne', () => {
    const resultat = comptesANotifier({
      impactes: ids(10),
      avecContrat: ids(6000, 'c'),
      importTermine: true,
      limite: 500,
      forcer: false,
    })
    expect(resultat.borne).toBe(false)
    expect(resultat.datesContrat).toHaveLength(6000)
  })

  it('après un import idposte au-delà de la borne : contacts entiers bloqués, dates de contrat envoyées quand même', () => {
    const resultat = comptesANotifier({
      impactes: ids(501),
      avecContrat: ['u0', 'c0'],
      importTermine: true,
      limite: 500,
      forcer: false,
    })
    expect(resultat).toEqual({
      contactsComplets: [],
      datesContrat: ['u0', 'c0'],
      borne: true,
    })
  })
})
