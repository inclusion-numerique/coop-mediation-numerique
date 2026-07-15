import {
  Franchissement,
  type InscriptionEnCours,
  ProfilInscription,
  UserId,
} from '@app/web/features/inscription/domain'
import { choisirProfil } from './choisir-profil'

const userId = UserId('550e8400-e29b-41d4-a716-446655440000')
const acceptationCgu = new Date('2026-01-01T10:00:00.000Z')
const le = new Date('2026-02-02T09:00:00.000Z')

const inscriptionEnCours: InscriptionEnCours = {
  _tag: 'EnCours',
  userId,
  profil: ProfilInscription('Mediateur'),
  acceptationCgu,
  progression: {
    structureEmployeuse: Franchissement(acceptationCgu),
    lieuxActivite: Franchissement(null),
  },
}

describe('choisirProfil', () => {
  it('pose le profil choisi et son compte de rôle, CGU datées de l’instant du choix', async () => {
    const enregistrerProfilChoisi = jest.fn(async () => undefined)

    const result = await choisirProfil({
      getInscriptionEtat: async () => ({ _tag: 'NonDemarree', userId }),
      enregistrerProfilChoisi,
      maintenant: le,
    })({ userId, profil: ProfilInscription('Coordinateur') })

    expect(result).toEqual({
      success: true,
      data: { profil: 'Coordinateur' },
    })
    expect(enregistrerProfilChoisi).toHaveBeenCalledWith({
      roles: { mediateur: false, coordinateur: true },
      etat: expect.objectContaining({
        _tag: 'EnCours',
        userId,
        profil: 'Coordinateur',
        acceptationCgu: le,
      }),
    })
  })

  it('conserve les étapes déjà franchies lors d’un re-choix', async () => {
    const enregistrerProfilChoisi = jest.fn(async () => undefined)

    await choisirProfil({
      getInscriptionEtat: async () => inscriptionEnCours,
      enregistrerProfilChoisi,
      maintenant: le,
    })({ userId, profil: ProfilInscription('Coordinateur') })

    expect(enregistrerProfilChoisi).toHaveBeenCalledWith(
      expect.objectContaining({
        etat: expect.objectContaining({
          progression: expect.objectContaining({
            structureEmployeuse: { _tag: 'franchi', le: acceptationCgu },
          }),
        }),
      }),
    )
  })

  it('refuse un utilisateur inconnu sans rien écrire', async () => {
    const enregistrerProfilChoisi = jest.fn(async () => undefined)

    const result = await choisirProfil({
      getInscriptionEtat: async () => null,
      enregistrerProfilChoisi,
      maintenant: le,
    })({ userId, profil: ProfilInscription('Mediateur') })

    expect(result).toEqual({
      success: false,
      error: { _tag: 'InscriptionIntrouvable', userId },
    })
    expect(enregistrerProfilChoisi).not.toHaveBeenCalled()
  })

  it('refuse de re-choisir un profil sur une inscription validée', async () => {
    const enregistrerProfilChoisi = jest.fn(async () => undefined)

    const result = await choisirProfil({
      getInscriptionEtat: async () => ({
        ...inscriptionEnCours,
        _tag: 'Validee',
        inscriptionValidee: le,
      }),
      enregistrerProfilChoisi,
      maintenant: le,
    })({ userId, profil: ProfilInscription('Coordinateur') })

    expect(result).toEqual({
      success: false,
      error: { _tag: 'InscriptionDejaValidee', userId },
    })
    expect(enregistrerProfilChoisi).not.toHaveBeenCalled()
  })
})
