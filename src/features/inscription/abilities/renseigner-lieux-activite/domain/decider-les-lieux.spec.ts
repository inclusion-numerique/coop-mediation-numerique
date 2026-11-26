import { describe, expect, it } from 'vitest'
import {
  Franchissement,
  type InscriptionEnCours,
  Role,
  UtilisateurId,
} from '@/features/inscription/domain'
import { deciderLesLieux } from './decider-les-lieux'

const userId = UtilisateurId('11111111-1111-1111-1111-111111111111')
const maintenant = new Date('2026-07-16T10:00:00.000Z')
const acceptationCgu = new Date('2026-07-01T00:00:00.000Z')

const enCours: InscriptionEnCours = {
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

describe('deciderLesLieux (décideur d’état)', () => {
  it('franchit l’étape lieux d’activité à l’instant fourni', () => {
    expect(deciderLesLieux(enCours, userId, maintenant)).toEqual({
      success: true,
      data: {
        etatFranchi: {
          _tag: 'EnCours',
          userId,
          role: Role('Mediateur'),
          conseillerNumerique: false,
          acceptationCgu,
          progression: {
            structureEmployeuse: Franchissement(null),
            lieuxActivite: Franchissement(maintenant),
          },
        },
      },
    })
  })
})
