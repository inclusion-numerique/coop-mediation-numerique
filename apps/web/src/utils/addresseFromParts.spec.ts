import { addresseFromParts } from './addresseFromParts'

describe('addresseFromParts', () => {
  it('assemble voie, code postal et commune', () => {
    expect(
      addresseFromParts({
        adresse: '27 Rue Saint-Guillaume',
        codePostal: '75007',
        commune: 'Paris',
      }),
    ).toBe('27 Rue Saint-Guillaume, 75007 Paris')
  })

  // Cas de production : 216 employeuses n'ont pas de voie côté Entrepôt.
  it('n’ouvre pas sur une virgule quand la voie manque', () => {
    expect(addresseFromParts({ codePostal: '66300', commune: 'Thuir' })).toBe(
      '66300 Thuir',
    )
  })

  // Établissement non diffusible : seule la commune est sûre.
  it('rend la commune seule quand c’est tout ce qu’on a', () => {
    expect(
      addresseFromParts({ adresse: '', codePostal: '', commune: 'Trelissac' }),
    ).toBe('Trelissac')
  })

  it('rend la voie seule quand la localité manque', () => {
    expect(addresseFromParts({ adresse: '27 Rue Saint-Guillaume' })).toBe(
      '27 Rue Saint-Guillaume',
    )
  })

  it('rend une chaîne vide quand aucune composante n’est renseignée', () => {
    expect(addresseFromParts({})).toBe('')
    expect(
      addresseFromParts({ adresse: null, codePostal: null, commune: null }),
    ).toBe('')
  })
})
