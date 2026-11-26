import { describe, expect, it } from 'vitest'
import { type ProfilDAccueil, selonLeProfil } from './accueil'
import { CoordinateurId } from './coordinateur-id'
import { MediateurId } from './mediateur-id'

const coordinateur: ProfilDAccueil = {
  _tag: 'Coordinateur',
  coordinateurId: CoordinateurId('9b2c3d4e-5f6a-4b7c-9d8e-0f1a2b3c4d5e'),
}

const mediateur: ProfilDAccueil = {
  _tag: 'Mediateur',
  mediateurId: MediateurId('8a1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d'),
  bienvenue: false,
}

const sections = {
  Coordinateur: () => 'coordination',
  Mediateur: () => 'médiation',
}

describe('accueil selon le profil', () => {
  it('compose l’accueil d’un coordinateur', () => {
    expect(selonLeProfil(coordinateur, sections)).toBe('coordination')
  })

  it('compose l’accueil d’un médiateur', () => {
    expect(selonLeProfil(mediateur, sections)).toBe('médiation')
  })
})
