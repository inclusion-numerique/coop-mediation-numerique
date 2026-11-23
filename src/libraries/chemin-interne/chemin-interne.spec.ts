import { describe, expect, it } from 'vitest'
import { cheminInterne } from './chemin-interne'

describe('chemin interne', () => {
  it('garde un chemin de l’application avec sa requête et son ancre', () => {
    expect(cheminInterne('/coop/mes-activites?page=2#liste')).toBe(
      '/coop/mes-activites?page=2#liste',
    )
  })

  it('remplace une adresse d’un autre site par le repli', () => {
    expect(cheminInterne('https://evil.example')).toBe('/')
  })

  it('remplace une adresse sans protocole par le repli', () => {
    expect(cheminInterne('//evil.example')).toBe('/')
  })

  it('remplace une barre oblique inversée par le repli', () => {
    expect(cheminInterne('/\\evil.example')).toBe('/')
  })

  it('remplace une tabulation qui cache une adresse par le repli', () => {
    expect(cheminInterne('/\t/evil.example')).toBe('/')
  })

  it('remplace un suffixe de domaine par le repli', () => {
    expect(cheminInterne('.evil.example')).toBe('/')
  })

  it('remplace une absence de chemin par le repli choisi', () => {
    expect(cheminInterne(undefined, '/connexion/suivant')).toBe(
      '/connexion/suivant',
    )
  })
})
