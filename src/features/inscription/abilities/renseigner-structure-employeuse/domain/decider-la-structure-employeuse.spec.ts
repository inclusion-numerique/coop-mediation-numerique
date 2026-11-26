import { describe, expect, it } from 'vitest'
import {
  Franchissement,
  type InscriptionEnCours,
  Role,
  UtilisateurId,
} from '@/features/inscription/domain'
import { deciderLaStructureEmployeuse } from './decider-la-structure-employeuse'

const userId = UtilisateurId('550e8400-e29b-41d4-a716-446655440000')
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

describe('deciderLaStructureEmployeuse', () => {
  it('porte l’étape structure employeuse franchie sur l’état', () => {
    expect(
      deciderLaStructureEmployeuse(inscriptionEnCours, userId, le),
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
})
