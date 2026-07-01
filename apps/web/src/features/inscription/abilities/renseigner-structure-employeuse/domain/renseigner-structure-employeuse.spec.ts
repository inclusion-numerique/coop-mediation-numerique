import { UserId } from '@app/web/features/inscription/domain'
import { renseignerStructureEmployeuse } from './renseigner-structure-employeuse'
import type { StructureEmployeuseInput } from './structure-employeuse-input'
import { StructureId } from './structure-id'

const userId = UserId('550e8400-e29b-41d4-a716-446655440000')
const structureId = StructureId('550e8400-e29b-41d4-a716-446655440001')

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
      ensureStructureEmployeuse,
      lierEmploi,
    })({ userId, structureEmployeuse })

    expect(result).toEqual({ structureId })
    expect(ensureStructureEmployeuse).toHaveBeenCalledWith({
      userId,
      structureEmployeuse,
    })
    expect(lierEmploi).toHaveBeenCalledWith({ userId, structureId })
  })
})
