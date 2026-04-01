import { classifyLieu, classifyLieux } from './classifyLieu'
import type { LieuActiviteInput } from './lieuActiviteInput'

describe('classifyLieu', () => {
  describe('case: link-existing', () => {
    it('should return link-existing when lieu has internal id', () => {
      const lieu: LieuActiviteInput = {
        id: 'structure-123',
        nom: 'Test Structure',
      }

      const result = classifyLieu(lieu, new Map())

      expect(result).toEqual({
        case: 'link-existing',
        structureId: 'structure-123',
      })
    })

    it('should prioritize internal id over cartoId', () => {
      const lieu: LieuActiviteInput = {
        id: 'structure-123',
        structureCartographieNationaleId: 'carto-456',
        nom: 'Test Structure',
      }

      const result = classifyLieu(lieu, new Map())

      expect(result).toEqual({
        case: 'link-existing',
        structureId: 'structure-123',
      })
    })

    it('should return link-existing when cartoId exists and structure found in map', () => {
      const lieu: LieuActiviteInput = {
        structureCartographieNationaleId: 'carto-456',
        nom: 'Test Structure',
      }

      const existingStructures = new Map([
        ['carto-456', 'existing-structure-id'],
      ])

      const result = classifyLieu(lieu, existingStructures)

      expect(result).toEqual({
        case: 'link-existing',
        structureId: 'existing-structure-id',
      })
    })
  })

  describe('case: create-from-data', () => {
    it('should return create-from-data when no id and no cartoId', () => {
      const lieu: LieuActiviteInput = {
        nom: 'Croix-Rouge Ancenis',
        siret: '12345678901234',
        adresse: '1 rue de la Paix',
        commune: 'Ancenis',
        codePostal: '44150',
        codeInsee: '44003',
      }

      const result = classifyLieu(lieu, new Map())

      expect(result).toEqual({
        case: 'create-from-data',
        data: {
          nom: 'Croix-Rouge Ancenis',
          siret: '12345678901234',
          adresse: '1 rue de la Paix',
          commune: 'Ancenis',
          codePostal: '44150',
          codeInsee: '44003',
          complementAdresse: undefined,
        },
      })
    })

    it('should handle missing optional fields with defaults', () => {
      const lieu: LieuActiviteInput = {
        nom: 'Minimal Structure',
      }

      const result = classifyLieu(lieu, new Map())

      expect(result).toEqual({
        case: 'create-from-data',
        data: {
          nom: 'Minimal Structure',
          siret: undefined,
          adresse: '',
          commune: '',
          codePostal: '',
          codeInsee: undefined,
          complementAdresse: undefined,
        },
      })
    })
  })

  describe('case: create-from-carto', () => {
    it('should return create-from-carto when cartoId exists but structure not found', () => {
      const lieu: LieuActiviteInput = {
        structureCartographieNationaleId: 'carto-789',
        nom: 'New Carto Structure',
      }

      const existingStructures = new Map([['other-carto', 'other-structure']])

      const result = classifyLieu(lieu, existingStructures)

      expect(result).toEqual({
        case: 'create-from-carto',
        cartoId: 'carto-789',
      })
    })

    it('should return create-from-carto when map is empty', () => {
      const lieu: LieuActiviteInput = {
        structureCartographieNationaleId: 'carto-789',
        nom: 'New Carto Structure',
      }

      const result = classifyLieu(lieu, new Map())

      expect(result).toEqual({
        case: 'create-from-carto',
        cartoId: 'carto-789',
      })
    })
  })
})

describe('classifyLieux', () => {
  it('should classify multiple lieux', () => {
    const lieux: LieuActiviteInput[] = [
      { id: 'struct-1', nom: 'Existing' },
      { nom: 'From API', siret: '123' },
      { structureCartographieNationaleId: 'carto-1', nom: 'From Carto' },
    ]

    const existingStructures = new Map<string, string>()

    const results = classifyLieux(lieux, existingStructures)

    expect(results).toHaveLength(3)
    expect(results[0]).toEqual({
      case: 'link-existing',
      structureId: 'struct-1',
    })
    expect(results[1].case).toBe('create-from-data')
    expect(results[2]).toEqual({
      case: 'create-from-carto',
      cartoId: 'carto-1',
    })
  })
})
