import { describe, expect, it } from 'vitest'
import type { UtilisateurExpose } from '../../domain'
import { utilisateurExpose } from './utilisateur-expose.transfer'

const creation = new Date('2025-03-01T08:00:00.000Z')
const modification = new Date('2026-10-02T09:30:00.000Z')
const suppression = new Date('2026-11-01T10:00:00.000Z')

const userId = '3c4d5e6f-7a8b-4c9d-8e0f-1a2b3c4d5e6f'
const mediateurId = '1a2b3c4d-5e6f-4708-8192-a3b4c5d6e7f8'
const coordinateurId = '0d1a1e7e-1f2b-4c3d-8e4f-5a6b7c8d9e0f'
const autreUserId = '7f8e9d0c-1b2a-4394-8576-a5b4c3d2e1f0'
const autreMediateurId = '9a8b7c6d-5e4f-4321-8a9b-c0d1e2f3a4b5'

const minimal: UtilisateurExpose = {
  id: userId,
  email: 'jeanne@example.com',
  firstName: null,
  lastName: null,
  phone: null,
  inscriptionValidee: null,
  created: creation,
  updated: modification,
  deleted: null,
  personneMain: null,
  mediateur: null,
  coordinateur: null,
}

const complet: UtilisateurExpose = {
  ...minimal,
  firstName: 'Jeanne',
  lastName: 'Martin',
  phone: '+33612345678',
  inscriptionValidee: creation,
  deleted: suppression,
  personneMain: {
    id: 314,
    cnPgId: 2718,
    conseillerNumeriqueEnPoste: { personneId: 314 },
    affectationsEmploi: [
      {
        id: 5,
        structureAdministrativeId: 17,
        createdAt: creation,
      },
      {
        id: 6,
        structureAdministrativeId: 18,
        createdAt: null,
      },
    ],
    contrats: [
      {
        structureId: 17,
        dateDebut: new Date('2024-01-01T00:00:00.000Z'),
        dateFin: new Date('2024-12-31T00:00:00.000Z'),
        dateRupture: null,
      },
      {
        structureId: 17,
        dateDebut: new Date('2025-01-01T00:00:00.000Z'),
        dateFin: null,
        dateRupture: new Date('2026-06-30T00:00:00.000Z'),
      },
    ],
  },
  mediateur: {
    id: mediateurId,
    creation,
    modification,
    isVisible: true,
    enActivite: [
      {
        id: 'a1b2c3d4-e5f6-4789-8abc-def012345678',
        structureId: 'b2c3d4e5-f6a7-4890-9bcd-ef0123456789',
        debut: creation,
        fin: suppression,
        creation,
        modification,
        suppression: null,
      },
    ],
    coordinations: [
      {
        id: 'c3d4e5f6-a7b8-4901-8cde-f01234567890',
        coordinateurId: 'd4e5f6a7-b8c9-4012-9def-012345678901',
        creation,
        modification,
        suppression,
        mediateur: { userId },
      },
    ],
  },
  coordinateur: {
    id: coordinateurId,
    creation,
    modification,
    mediateursCoordonnes: [
      {
        id: 'e5f6a7b8-c9d0-4123-8ef0-123456789012',
        mediateurId: autreMediateurId,
        creation,
        modification,
        suppression: null,
        mediateur: { userId: autreUserId },
      },
    ],
  },
}

describe('utilisateur exposé par l’API', () => {
  it('expose un utilisateur sans personne, médiateur ni coordinateur', () => {
    expect(utilisateurExpose(minimal)).toEqual({
      email: 'jeanne@example.com',
      prenom: null,
      nom: null,
      inscription_validee: null,
      telephone: null,
      creation: '2025-03-01T08:00:00.000Z',
      modification: '2026-10-02T09:30:00.000Z',
      suppression: null,
      dataspace_id: null,
      emplois: [],
      mediateur: null,
      coordinateur: null,
      conseiller_numerique: { is_conseiller_numerique: false, id_pg: null },
    })
  })

  it('expose un conseiller numérique médiateur et coordinateur', () => {
    expect(utilisateurExpose(complet)).toEqual({
      email: 'jeanne@example.com',
      prenom: 'Jeanne',
      nom: 'Martin',
      inscription_validee: '2025-03-01T08:00:00.000Z',
      telephone: '+33612345678',
      creation: '2025-03-01T08:00:00.000Z',
      modification: '2026-10-02T09:30:00.000Z',
      suppression: '2026-11-01T10:00:00.000Z',
      dataspace_id: 314,
      emplois: [
        {
          id: '5',
          structure_id: 17,
          debut: '2025-01-01T00:00:00.000Z',
          fin: '2026-06-30T00:00:00.000Z',
          creation: '2025-03-01T08:00:00.000Z',
          modification: '2025-03-01T08:00:00.000Z',
          suppression: null,
        },
        {
          id: '6',
          structure_id: 18,
          debut: null,
          fin: null,
          creation: '1970-01-01T00:00:00.000Z',
          modification: '1970-01-01T00:00:00.000Z',
          suppression: null,
        },
      ],
      mediateur: {
        id: mediateurId,
        user_id: userId,
        creation: '2025-03-01T08:00:00.000Z',
        modification: '2026-10-02T09:30:00.000Z',
        is_visible: true,
        en_activite: [
          {
            id: 'a1b2c3d4-e5f6-4789-8abc-def012345678',
            structure_id: 'b2c3d4e5-f6a7-4890-9bcd-ef0123456789',
            debut: '2025-03-01T08:00:00.000Z',
            fin: '2026-11-01T10:00:00.000Z',
            creation: '2025-03-01T08:00:00.000Z',
            modification: '2026-10-02T09:30:00.000Z',
            suppression: null,
          },
        ],
        coordinations: [
          {
            id: 'c3d4e5f6-a7b8-4901-8cde-f01234567890',
            user_id: userId,
            creation: '2025-03-01T08:00:00.000Z',
            modification: '2026-10-02T09:30:00.000Z',
            suppression: '2026-11-01T10:00:00.000Z',
            coordinateur_id: 'd4e5f6a7-b8c9-4012-9def-012345678901',
          },
        ],
      },
      coordinateur: {
        id: coordinateurId,
        user_id: userId,
        creation: '2025-03-01T08:00:00.000Z',
        modification: '2026-10-02T09:30:00.000Z',
        mediateurs_coordonnes: [
          {
            id: 'e5f6a7b8-c9d0-4123-8ef0-123456789012',
            user_id: autreUserId,
            creation: '2025-03-01T08:00:00.000Z',
            modification: '2026-10-02T09:30:00.000Z',
            suppression: null,
            mediateur_id: autreMediateurId,
          },
        ],
      },
      conseiller_numerique: { is_conseiller_numerique: true, id_pg: 2718 },
    })
  })

  it('n’expose pas comme conseiller numérique une personne sans poste', () => {
    expect(
      utilisateurExpose({
        ...minimal,
        personneMain: {
          id: 314,
          cnPgId: 2718,
          conseillerNumeriqueEnPoste: null,
          affectationsEmploi: [],
          contrats: [],
        },
      }).conseiller_numerique,
    ).toEqual({ is_conseiller_numerique: false, id_pg: 2718 })
  })
})
