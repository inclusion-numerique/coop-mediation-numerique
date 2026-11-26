import { describe, expect, it } from 'vitest'
import {
  AdhesionId,
  CoordinateurId,
  Courriel,
  MediateurId,
  UtilisateurId,
} from '../../../domain'
import type { AdhesionActive } from '../../../domain/adhesion'
import { ajouterUnMembre, type UtilisateurAAjouter } from './ajouter-un-membre'

const coordinateurId = CoordinateurId('550e8400-e29b-41d4-a716-446655440001')

const mediateurId = MediateurId('550e8400-e29b-41d4-a716-446655440011')

const utilisateurId = UtilisateurId('550e8400-e29b-41d4-a716-446655440031')

const auteurId = UtilisateurId('550e8400-e29b-41d4-a716-446655440041')

const mediateur: UtilisateurAAjouter = {
  type: 'Mediateur',
  mediateurId,
  email: Courriel('mediateur@example.com'),
}

const adhesionActive: AdhesionActive = {
  id: AdhesionId('550e8400-e29b-41d4-a716-446655440021'),
  mediateurId,
  coordinateurId,
  depuis: new Date('2026-02-01T09:00:00Z'),
  statut: 'Active',
}

describe('ajouter un membre à une équipe', () => {
  it('fait adhérer un médiateur qui n’est pas encore membre', async () => {
    const ajouter = ajouterUnMembre({
      lireLUtilisateurAAjouter: async () => mediateur,
      coordinateurExiste: async () => true,
      lireLesAdhesionsDeLaPaire: async () => [],
      enregistrerLAdhesion: async () => undefined,
    })

    expect(await ajouter({ utilisateurId, coordinateurId, auteurId })).toEqual({
      success: true,
      data: undefined,
    })
  })

  it('échoue sur un utilisateur introuvable', async () => {
    const ajouter = ajouterUnMembre({
      lireLUtilisateurAAjouter: async () => null,
      coordinateurExiste: async () => true,
      lireLesAdhesionsDeLaPaire: async () => [],
      enregistrerLAdhesion: async () => undefined,
    })

    expect(await ajouter({ utilisateurId, coordinateurId, auteurId })).toEqual({
      success: false,
      error: { _tag: 'UtilisateurIntrouvable' },
    })
  })

  it('est réservé à un médiateur', async () => {
    const ajouter = ajouterUnMembre({
      lireLUtilisateurAAjouter: async () => ({ type: 'NonMediateur' }),
      coordinateurExiste: async () => true,
      lireLesAdhesionsDeLaPaire: async () => [],
      enregistrerLAdhesion: async () => undefined,
    })

    expect(await ajouter({ utilisateurId, coordinateurId, auteurId })).toEqual({
      success: false,
      error: { _tag: 'UtilisateurNonMediateur' },
    })
  })

  it('échoue quand le coordinateur de l’équipe est introuvable', async () => {
    const ajouter = ajouterUnMembre({
      lireLUtilisateurAAjouter: async () => mediateur,
      coordinateurExiste: async () => false,
      lireLesAdhesionsDeLaPaire: async () => [],
      enregistrerLAdhesion: async () => undefined,
    })

    expect(await ajouter({ utilisateurId, coordinateurId, auteurId })).toEqual({
      success: false,
      error: { _tag: 'CoordinateurIntrouvable' },
    })
  })

  it('échoue pour un médiateur déjà membre de l’équipe', async () => {
    const ajouter = ajouterUnMembre({
      lireLUtilisateurAAjouter: async () => mediateur,
      coordinateurExiste: async () => true,
      lireLesAdhesionsDeLaPaire: async () => [adhesionActive],
      enregistrerLAdhesion: async () => undefined,
    })

    expect(await ajouter({ utilisateurId, coordinateurId, auteurId })).toEqual({
      success: false,
      error: { _tag: 'DejaMembre', mediateurId },
    })
  })
})
