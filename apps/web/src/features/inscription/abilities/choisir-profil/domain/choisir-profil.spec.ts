import {
  Franchissement,
  type InscriptionEnCours,
  Role,
  UserId,
} from '@app/web/features/inscription/domain'
import { choisirProfil } from './choisir-profil'

const userId = UserId('550e8400-e29b-41d4-a716-446655440000')
const acceptationCgu = new Date('2026-01-01T10:00:00.000Z')
const le = new Date('2026-02-02T09:00:00.000Z')

const inscriptionEnCours: InscriptionEnCours = {
  _tag: 'EnCours',
  userId,
  role: Role('Mediateur'),
  conseillerNumerique: false,
  acceptationCgu,
  progression: {
    structureEmployeuse: Franchissement(acceptationCgu),
    lieuxActivite: Franchissement(null),
  },
}

describe('choisirProfil', () => {
  it('décide le rôle, son compte et l’état à écrire, CGU datées de l’instant du choix', () => {
    expect(
      choisirProfil(
        { _tag: 'NonDemarree', userId },
        { userId, role: Role('Coordinateur') },
        le,
      ),
    ).toEqual({
      success: true,
      data: {
        role: Role('Coordinateur'),
        aEnregistrer: {
          roles: { mediateur: false, coordinateur: true },
          etat: {
            _tag: 'EnCours',
            userId,
            role: Role('Coordinateur'),
            conseillerNumerique: false,
            acceptationCgu: le,
            progression: {
              structureEmployeuse: Franchissement(null),
              lieuxActivite: Franchissement(null),
            },
          },
        },
      },
    })
  })

  it('conserve les étapes déjà franchies lors d’un re-choix', () => {
    expect(
      choisirProfil(
        inscriptionEnCours,
        { userId, role: Role('Coordinateur') },
        le,
      ),
    ).toEqual({
      success: true,
      data: {
        role: Role('Coordinateur'),
        aEnregistrer: {
          roles: { mediateur: false, coordinateur: true },
          etat: {
            _tag: 'EnCours',
            userId,
            role: Role('Coordinateur'),
            conseillerNumerique: false,
            acceptationCgu: le,
            progression: {
              structureEmployeuse: Franchissement(acceptationCgu),
              lieuxActivite: Franchissement(null),
            },
          },
        },
      },
    })
  })

  it('refuse un utilisateur inconnu', () => {
    expect(
      choisirProfil(null, { userId, role: Role('Mediateur') }, le),
    ).toEqual({
      success: false,
      error: { _tag: 'InscriptionIntrouvable', userId },
    })
  })

  it('refuse de re-choisir un rôle sur une inscription validée', () => {
    expect(
      choisirProfil(
        { ...inscriptionEnCours, _tag: 'Validee', inscriptionValidee: le },
        { userId, role: Role('Coordinateur') },
        le,
      ),
    ).toEqual({
      success: false,
      error: { _tag: 'InscriptionDejaValidee', userId },
    })
  })
})
