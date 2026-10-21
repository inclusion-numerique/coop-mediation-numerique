import { nomAffiche } from './nom-affiche'

describe('nom affiché d’un compte', () => {
  it.each([
    [{ prenom: 'Ada', nom: 'Lovelace' }, 'Ada Lovelace'],
    [{ prenom: 'Ada', nom: null }, 'Ada'],
    [{ prenom: null, nom: null, nomComplet: 'A. Lovelace' }, 'A. Lovelace'],
    [{ prenom: null, nom: null, nomComplet: null }, 'ada@example.com'],
  ])('%o donne « %s »', (identite, attendu) => {
    expect(
      nomAffiche({
        nomComplet: null,
        courriel: 'ada@example.com',
        ...identite,
      }),
    ).toBe(attendu)
  })
})
