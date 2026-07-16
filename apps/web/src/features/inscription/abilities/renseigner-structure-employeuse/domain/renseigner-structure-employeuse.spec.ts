import {
  Franchissement,
  type InscriptionEnCours,
  Role,
  UserId,
} from '@app/web/features/inscription/domain'
import { renseignerStructureEmployeuse } from './renseigner-structure-employeuse'

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
    structureEmployeuse: Franchissement(null),
    lieuxActivite: Franchissement(null),
  },
}

describe('renseignerStructureEmployeuse', () => {
  it('porte l’étape structure employeuse franchie sur l’état', () => {
    expect(
      renseignerStructureEmployeuse(inscriptionEnCours, userId, le),
    ).toEqual({
      success: true,
      data: {
        etatFranchi: {
          _tag: 'EnCours',
          userId,
          role: Role('Mediateur'),
          conseillerNumerique: false,
          acceptationCgu,
          progression: {
            structureEmployeuse: Franchissement(le),
            lieuxActivite: Franchissement(null),
          },
        },
      },
    })
  })

  it('refuse un utilisateur inconnu', () => {
    expect(renseignerStructureEmployeuse(null, userId, le)).toEqual({
      success: false,
      error: { _tag: 'InscriptionIntrouvable', userId },
    })
  })

  it('refuse tant que le profil n’est pas choisi', () => {
    expect(
      renseignerStructureEmployeuse(
        { _tag: 'NonDemarree', userId },
        userId,
        le,
      ),
    ).toEqual({
      success: false,
      error: { _tag: 'ProfilNonChoisi', userId },
    })
  })

  it('refuse une inscription déjà validée', () => {
    expect(
      renseignerStructureEmployeuse(
        { ...inscriptionEnCours, _tag: 'Validee', inscriptionValidee: le },
        userId,
        le,
      ),
    ).toEqual({
      success: false,
      error: { _tag: 'InscriptionDejaValidee', userId },
    })
  })
})
