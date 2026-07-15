import {
  Franchissement,
  type InscriptionEnCours,
  ProfilInscription,
  UserId,
} from '@app/web/features/inscription/domain'
import { renseignerStructureEmployeuse } from './renseigner-structure-employeuse'
import type { StructureEmployeuseInput } from './structure-employeuse-input'
import { StructureId } from './structure-id'

const userId = UserId('550e8400-e29b-41d4-a716-446655440000')
const structureId = StructureId('550e8400-e29b-41d4-a716-446655440001')
const le = new Date('2026-02-02T09:00:00.000Z')

const inscriptionEnCours: InscriptionEnCours = {
  _tag: 'EnCours',
  userId,
  profil: ProfilInscription('Mediateur'),
  acceptationCgu: new Date('2026-01-01T10:00:00.000Z'),
  progression: {
    structureEmployeuse: Franchissement(null),
    lieuxActivite: Franchissement(null),
  },
}

const structureEmployeuse: StructureEmployeuseInput = {
  id: null,
  nom: 'Ma Structure',
  siret: '35600000000048',
  adresse: {
    id: 'adr-1',
    nom: '12 rue de la Paix',
    commune: 'Paris',
    codeInsee: '75101',
    codePostal: '75001',
    contexte: '75, Paris',
    latitude: 48.86,
    longitude: 2.33,
  },
  typologies: [],
}

describe('renseignerStructureEmployeuse', () => {
  it('garantit la structure puis la lie comme employeuse', async () => {
    const ensureStructureEmployeuse = jest.fn(async () => structureId)
    const lierEmploi = jest.fn(async () => undefined)

    const result = await renseignerStructureEmployeuse({
      getInscriptionEtat: async () => inscriptionEnCours,
      ensureStructureEmployeuse,
      lierEmploi,
      maintenant: le,
    })({ userId, structureEmployeuse })

    expect(result).toEqual({ success: true, data: { structureId } })
    expect(ensureStructureEmployeuse).toHaveBeenCalledWith({
      userId,
      structureEmployeuse,
    })
  })

  it('lie l’emploi en portant l’étape structure employeuse franchie', async () => {
    const lierEmploi = jest.fn(async () => undefined)

    await renseignerStructureEmployeuse({
      getInscriptionEtat: async () => inscriptionEnCours,
      ensureStructureEmployeuse: async () => structureId,
      lierEmploi,
      maintenant: le,
    })({ userId, structureEmployeuse })

    expect(lierEmploi).toHaveBeenCalledWith({
      structureId,
      etat: expect.objectContaining({
        _tag: 'EnCours',
        userId,
        progression: expect.objectContaining({
          structureEmployeuse: { _tag: 'franchi', le },
        }),
      }),
    })
  })

  it('refuse tant que le profil n’est pas choisi, sans créer de structure', async () => {
    const ensureStructureEmployeuse = jest.fn(async () => structureId)
    const lierEmploi = jest.fn(async () => undefined)

    const result = await renseignerStructureEmployeuse({
      getInscriptionEtat: async () => ({ _tag: 'NonDemarree', userId }),
      ensureStructureEmployeuse,
      lierEmploi,
      maintenant: le,
    })({ userId, structureEmployeuse })

    expect(result).toEqual({
      success: false,
      error: { _tag: 'ProfilNonChoisi', userId },
    })
    expect(ensureStructureEmployeuse).not.toHaveBeenCalled()
    expect(lierEmploi).not.toHaveBeenCalled()
  })
})
