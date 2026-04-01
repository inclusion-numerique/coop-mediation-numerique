import { isNewLieu } from './isNewLieu'
import type { LieuActiviteInput } from './lieuActiviteInput'

describe('isNewLieu', () => {
  describe('when lieu has internal id', () => {
    it('should keep lieu when id is not in existing activites', () => {
      const lieux: LieuActiviteInput[] = [
        { id: 'struct-new', nom: 'New Structure' },
      ]
      const existingIds = new Set(['struct-existing'])

      const result = lieux.filter(isNewLieu(existingIds))

      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('struct-new')
    })

    it('should filter out lieu when id is already in existing activites', () => {
      const lieux: LieuActiviteInput[] = [
        { id: 'struct-existing', nom: 'Existing Structure' },
      ]
      const existingIds = new Set(['struct-existing'])

      const result = lieux.filter(isNewLieu(existingIds))

      expect(result).toHaveLength(0)
    })
  })

  describe('when lieu has cartoId but no internal id', () => {
    it('should always keep lieu with cartoId', () => {
      const lieux: LieuActiviteInput[] = [
        {
          structureCartographieNationaleId: 'carto-123',
          nom: 'Carto Structure',
        },
      ]
      const existingIds = new Set(['some-other-struct'])

      const result = lieux.filter(isNewLieu(existingIds))

      expect(result).toHaveLength(1)
    })
  })

  describe('when lieu has only nom (from API Entreprise)', () => {
    it('should keep lieu with nom when no id or cartoId', () => {
      const lieux: LieuActiviteInput[] = [
        { nom: 'Croix-Rouge Ancenis', siret: '12345678901234' },
      ]
      const existingIds = new Set<string>()

      const result = lieux.filter(isNewLieu(existingIds))

      expect(result).toHaveLength(1)
      expect(result[0].nom).toBe('Croix-Rouge Ancenis')
    })
  })

  describe('mixed scenarios', () => {
    it('should correctly filter mixed lieux', () => {
      const lieux: LieuActiviteInput[] = [
        { id: 'already-linked', nom: 'Already Linked' },
        { id: 'new-struct', nom: 'New Internal' },
        { structureCartographieNationaleId: 'carto-1', nom: 'From Carto' },
        { nom: 'From API', siret: '123' },
      ]
      const existingIds = new Set(['already-linked'])

      const result = lieux.filter(isNewLieu(existingIds))

      expect(result).toHaveLength(3)
      expect(result.map((l) => l.nom)).toEqual([
        'New Internal',
        'From Carto',
        'From API',
      ])
    })

    it('should return empty array when all lieux are already linked', () => {
      const lieux: LieuActiviteInput[] = [
        { id: 'struct-1', nom: 'One' },
        { id: 'struct-2', nom: 'Two' },
      ]
      const existingIds = new Set(['struct-1', 'struct-2'])

      const result = lieux.filter(isNewLieu(existingIds))

      expect(result).toHaveLength(0)
    })

    it('should return all lieux when existing set is empty', () => {
      const lieux: LieuActiviteInput[] = [
        { id: 'struct-1', nom: 'One' },
        { structureCartographieNationaleId: 'carto-1', nom: 'Two' },
        { nom: 'Three' },
      ]

      const result = lieux.filter(isNewLieu(new Set()))

      expect(result).toHaveLength(3)
    })
  })
})
