import { describe, expect, it } from 'vitest'
import { AdresseCourriel } from './adresse-courriel'
import { Nom } from './nom'
import { type Identite, NomAffiche, nomAffiche } from './nom-affiche'
import { Prenom } from './prenom'

describe('nom affiché d’un compte', () => {
  it.each<[Omit<Identite, 'courriel'>, string]>([
    [
      { prenom: Prenom('Ada'), nom: Nom('Lovelace'), nomComplet: null },
      'Ada Lovelace',
    ],
    [{ prenom: Prenom('Ada'), nom: null, nomComplet: null }, 'Ada'],
    [
      { prenom: null, nom: null, nomComplet: NomAffiche('A. Lovelace') },
      'A. Lovelace',
    ],
    [{ prenom: null, nom: null, nomComplet: null }, 'ada@example.com'],
  ])('%o donne « %s »', (identite, attendu) => {
    expect(
      nomAffiche({
        courriel: AdresseCourriel('ada@example.com'),
        ...identite,
      }),
    ).toBe(attendu)
  })
})
