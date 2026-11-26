import { describe, expect, it } from 'vitest'
import {
  EtapeDInscription,
  Franchissement,
  type InscriptionEtat,
  Role,
  UtilisateurId,
} from '@/features/inscription/domain'
import { choisirProfil } from './choisir-profil'

const userId = UtilisateurId('550e8400-e29b-41d4-a716-446655440000')
const acceptationCgu = new Date('2026-01-01T10:00:00.000Z')
const le = new Date('2026-02-02T09:00:00.000Z')

const nonDemarree: InscriptionEtat = { _tag: 'NonDemarree', userId }

const validee: InscriptionEtat = {
  _tag: 'Validee',
  userId,
  role: Role('Mediateur'),
  conseillerNumerique: false,
  acceptationCgu,
  progression: {
    structureEmployeuse: Franchissement(acceptationCgu),
    lieuxActivite: Franchissement(acceptationCgu),
  },
  inscriptionValidee: acceptationCgu,
}

const choisir = (etat: InscriptionEtat | null) =>
  choisirProfil({
    lireLEtat: async () => etat,
    enregistrerProfilChoisi: async () => undefined,
  })

describe('choisirProfil', () => {
  it('mène un coordinateur directement au récapitulatif', async () => {
    expect(
      await choisir(nonDemarree)({ userId, role: Role('Coordinateur') }, le),
    ).toEqual({
      success: true,
      data: {
        role: Role('Coordinateur'),
        etapeSuivante: EtapeDInscription('recapitulatif'),
      },
    })
  })

  it('mène un médiateur à la vérification de ses informations', async () => {
    expect(
      await choisir(nonDemarree)({ userId, role: Role('Mediateur') }, le),
    ).toEqual({
      success: true,
      data: {
        role: Role('Mediateur'),
        etapeSuivante: EtapeDInscription('verifier-informations'),
      },
    })
  })

  it('refuse un utilisateur inconnu', async () => {
    expect(
      await choisir(null)({ userId, role: Role('Mediateur') }, le),
    ).toEqual({
      success: false,
      error: { _tag: 'InscriptionIntrouvable', userId },
    })
  })

  it('refuse de re-choisir un rôle sur une inscription validée', async () => {
    expect(
      await choisir(validee)({ userId, role: Role('Coordinateur') }, le),
    ).toEqual({
      success: false,
      error: { _tag: 'InscriptionDejaValidee', userId },
    })
  })
})
