import { describe, expect, it } from 'vitest'
import {
  estFranchi,
  Franchissement,
  type InscriptionEnCours,
  type InscriptionEtat,
  Role,
  UtilisateurId,
} from '@/features/inscription/domain'
import { deciderLesLieux } from './decider-les-lieux'

const userId = UtilisateurId('11111111-1111-1111-1111-111111111111')
const maintenant = new Date('2026-07-16T10:00:00.000Z')

const enCours: InscriptionEnCours = {
  _tag: 'EnCours',
  userId,
  role: Role('Mediateur'),
  conseillerNumerique: false,
  acceptationCgu: new Date('2026-07-01T00:00:00.000Z'),
  progression: {
    structureEmployeuse: Franchissement(null),
    lieuxActivite: Franchissement(null),
  },
}

describe('deciderLesLieux (décideur d’état)', () => {
  it('refuse une inscription introuvable', () => {
    const resultat = deciderLesLieux(null, userId, maintenant)

    expect(resultat).toEqual({
      success: false,
      error: { _tag: 'InscriptionIntrouvable', userId },
    })
  })

  it('refuse une inscription non démarrée (profil non choisi)', () => {
    const nonDemarree: InscriptionEtat = { _tag: 'NonDemarree', userId }

    const resultat = deciderLesLieux(nonDemarree, userId, maintenant)

    expect(resultat).toEqual({
      success: false,
      error: { _tag: 'ProfilNonChoisi', userId },
    })
  })

  it('refuse une inscription déjà validée', () => {
    const validee: InscriptionEtat = {
      ...enCours,
      _tag: 'Validee',
      inscriptionValidee: maintenant,
    }

    const resultat = deciderLesLieux(validee, userId, maintenant)

    expect(resultat).toEqual({
      success: false,
      error: { _tag: 'InscriptionDejaValidee', userId },
    })
  })

  it('franchit l’étape lieux d’activité à l’instant fourni', () => {
    const resultat = deciderLesLieux(enCours, userId, maintenant)

    expect(resultat.success).toBe(true)
    if (!resultat.success) return
    expect(
      estFranchi(resultat.data.etatFranchi.progression.lieuxActivite),
    ).toBe(true)
  })
})
