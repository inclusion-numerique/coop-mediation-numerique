import {
  getEndOfDay,
  getEndOfMonth,
  getEndOfWeek,
  getEndOfYear,
  getOptionalEndOfDay,
  getOptionalEndOfMonth,
  getOptionalEndOfWeek,
  getOptionalEndOfYear,
  getOptionalStartOfDay,
  getOptionalStartOfMonth,
  getOptionalStartOfWeek,
  getOptionalStartOfYear,
  getStartOfDay,
  getStartOfMonth,
  getStartOfWeek,
  getStartOfYear,
} from './getDatePeriodBounds'

describe('getDatePeriodBounds', () => {
  // Test date: 2024-03-15 23:00:00 UTC+2
  const testDate = new Date('2024-03-15T23:00:00.000+02:00')
  const testUtcDate = new Date('2025-03-15T01:00:00.000Z')

  describe('day', () => {
    it('should get start of day in timezone', () => {
      const result = getStartOfDay(testDate)
      expect(result.toISOString()).toBe('2024-03-15T00:00:00.000Z')
    })

    it('should get start of day in utc', () => {
      const result = getStartOfDay(testUtcDate)
      expect(result.toISOString()).toBe('2025-03-15T00:00:00.000Z')
    })

    it('should get end of day in timezone', () => {
      const result = getEndOfDay(testDate)
      expect(result.toISOString()).toBe('2024-03-15T23:59:59.999Z')
    })

    it('should handle null date for optional start', () => {
      expect(getOptionalStartOfDay(null)).toBeNull()
    })

    it('should handle null date for optional end', () => {
      expect(getOptionalEndOfDay(null)).toBeNull()
    })
  })

  describe('week', () => {
    it('should get start of week in timezone', () => {
      const result = getStartOfWeek(testDate)
      expect(result.toISOString()).toBe('2024-03-11T00:00:00.000Z')
    })

    it('should get end of week in timezone', () => {
      const result = getEndOfWeek(testDate)
      expect(result.toISOString()).toBe('2024-03-17T23:59:59.999Z')
    })

    it('should handle null date for optional start', () => {
      expect(getOptionalStartOfWeek(null)).toBeNull()
    })

    it('should handle null date for optional end', () => {
      expect(getOptionalEndOfWeek(null)).toBeNull()
    })
  })

  describe('month', () => {
    it('should get start of month in timezone', () => {
      const result = getStartOfMonth(testDate)
      expect(result.toISOString()).toBe('2024-03-01T00:00:00.000Z')
    })

    it('should get end of month in timezone', () => {
      const result = getEndOfMonth(testDate)
      expect(result.toISOString()).toBe('2024-03-31T23:59:59.999Z')
    })

    it('should handle null date for optional start', () => {
      expect(getOptionalStartOfMonth(null)).toBeNull()
    })

    it('should handle null date for optional end', () => {
      expect(getOptionalEndOfMonth(null)).toBeNull()
    })
  })

  describe('year', () => {
    it('should get start of year in timezone', () => {
      const result = getStartOfYear(testDate)
      expect(result.toISOString()).toBe('2024-01-01T00:00:00.000Z')
    })

    it('should get end of year in timezone', () => {
      const result = getEndOfYear(testDate)
      expect(result.toISOString()).toBe('2024-12-31T23:59:59.999Z')
    })

    it('should handle null date for optional start', () => {
      expect(getOptionalStartOfYear(null)).toBeNull()
    })

    it('should handle null date for optional end', () => {
      expect(getOptionalEndOfYear(null)).toBeNull()
    })
  })
})
