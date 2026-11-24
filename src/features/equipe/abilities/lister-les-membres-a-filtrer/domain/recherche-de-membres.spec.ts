import { describe, expect, it } from 'vitest'
import { MediateurId } from '../../../domain/identifiants/mediateur-id'
import { Courriel } from '../../../domain/identite/courriel'
import { NomAffiche } from '../../../domain/identite/nom-affiche'
import type { MembreAFiltrer } from './membre-a-filtrer'
import { membresRecherches } from './recherche-de-membres'

const membre = (rang: number, nom: string, email: string): MembreAFiltrer => ({
  mediateurId: MediateurId(
    `0b3c4f62-2d6a-4f6e-9a39-3a4c8f1d2e${String(rang).padStart(2, '0')}`,
  ),
  nom: NomAffiche(nom),
  email: Courriel(email),
  situation: 'Membre',
})

const equipe = [
  membre(1, 'Hélène Dupré', 'helene@example.com'),
  membre(2, 'Ada Lovelace', 'ada@example.com'),
  membre(3, 'Grace Hopper', 'dupre.grace@example.com'),
]

const douze = Array.from({ length: 12 }, (_, rang) =>
  membre(rang, `Médiateur ${rang}`, `mediateur${rang}@example.com`),
)

describe('recherche de membres', () => {
  it('trouve un membre par son nom, sans tenir compte des accents', () => {
    expect(
      membresRecherches(equipe, 'helene').map(({ nom }) => nom),
    ).toStrictEqual(['Hélène Dupré'])
  })

  it('trouve un membre par son adresse électronique', () => {
    expect(
      membresRecherches(equipe, 'dupre').map(({ nom }) => nom),
    ).toStrictEqual(['Hélène Dupré', 'Grace Hopper'])
  })

  it('ne rend que les dix premiers', () => {
    expect(membresRecherches(douze, 'mediateur')).toHaveLength(10)
  })
})
