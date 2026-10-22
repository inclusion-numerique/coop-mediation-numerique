import { AdresseCourriel } from './adresse-courriel'
import { Nom } from './nom'
import { NomAffiche, nomAffiche } from './nom-affiche'
import { Prenom } from './prenom'

describe('nom affiché d’un compte', () => {
  it.each([
    [{ prenom: Prenom('Ada'), nom: Nom('Lovelace') }, 'Ada Lovelace'],
    [{ prenom: Prenom('Ada'), nom: null }, 'Ada'],
    [
      { prenom: null, nom: null, nomComplet: NomAffiche('A. Lovelace') },
      'A. Lovelace',
    ],
    [{ prenom: null, nom: null, nomComplet: null }, 'ada@example.com'],
  ])('%o donne « %s »', (identite, attendu) => {
    expect(
      nomAffiche({
        nomComplet: null,
        courriel: AdresseCourriel('ada@example.com'),
        ...identite,
      }),
    ).toBe(attendu)
  })
})
