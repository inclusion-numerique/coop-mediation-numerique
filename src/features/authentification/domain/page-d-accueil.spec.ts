import { describe, expect, it } from 'vitest'
import {
  adresseDeRetourApresConnexion,
  pageDAccueil,
} from '@/features/authentification/domain/page-d-accueil'
import { RoleDeLaSession } from './role-de-la-session'

const utilisateur: NonNullable<Parameters<typeof pageDAccueil>[0]> = {
  role: RoleDeLaSession('User'),
  inscriptionValidee: null,
  mediateur: null,
  coordinateur: null,
}

describe('pageDAccueil', () => {
  it('renvoie la landing sans utilisateur', () => {
    expect(pageDAccueil(null)).toBe('/')
  })

  it('renvoie l’administration pour un admin', () => {
    expect(
      pageDAccueil({ ...utilisateur, role: RoleDeLaSession('Admin') }),
    ).toBe('/administration')
  })

  it('renvoie l’inscription quand elle n’est pas validée', () => {
    expect(pageDAccueil(utilisateur)).toBe('/inscription')
  })

  it('renvoie l’inscription quand elle est validée sans aucun profil de rôle', () => {
    expect(
      pageDAccueil({ ...utilisateur, inscriptionValidee: new Date() }),
    ).toBe('/inscription')
  })

  it('renvoie la coop pour un médiateur inscrit', () => {
    expect(
      pageDAccueil({
        ...utilisateur,
        inscriptionValidee: new Date(),
        mediateur: { id: 'mediateur-id' },
      }),
    ).toBe('/coop')
  })

  it('renvoie la coop pour un coordinateur inscrit', () => {
    expect(
      pageDAccueil({
        ...utilisateur,
        inscriptionValidee: new Date(),
        coordinateur: { id: 'coordinateur-id' },
      }),
    ).toBe('/coop')
  })
})

describe('adresseDeRetourApresConnexion', () => {
  it('renvoie la connexion sans utilisateur', () => {
    expect(adresseDeRetourApresConnexion(null)).toBe('/connexion')
  })

  it('renvoie les utilisateurs de l’administration pour un admin', () => {
    expect(
      adresseDeRetourApresConnexion({
        ...utilisateur,
        role: RoleDeLaSession('Admin'),
      }),
    ).toBe('/administration/utilisateurs')
  })

  it('renvoie l’inscription quand elle n’est pas validée', () => {
    expect(adresseDeRetourApresConnexion(utilisateur)).toBe('/inscription')
  })

  it('renvoie l’inscription quand elle est validée sans aucun profil de rôle', () => {
    expect(
      adresseDeRetourApresConnexion({
        ...utilisateur,
        inscriptionValidee: new Date(),
      }),
    ).toBe('/inscription')
  })

  it('renvoie la coop pour un médiateur inscrit', () => {
    expect(
      adresseDeRetourApresConnexion({
        ...utilisateur,
        inscriptionValidee: new Date(),
        mediateur: { id: 'mediateur-id' },
      }),
    ).toBe('/coop')
  })

  it('renvoie la coop pour un coordinateur inscrit', () => {
    expect(
      adresseDeRetourApresConnexion({
        ...utilisateur,
        inscriptionValidee: new Date(),
        coordinateur: { id: 'coordinateur-id' },
      }),
    ).toBe('/coop')
  })
})
