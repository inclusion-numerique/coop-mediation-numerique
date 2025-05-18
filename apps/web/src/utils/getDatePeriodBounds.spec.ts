import {
  getStartOfDay,
  getOptionalStartOfDay,
  getEndOfDay,
  getOptionalEndOfDay,
  getStartOfWeek,
  getOptionalStartOfWeek,
  getEndOfWeek,
  getOptionalEndOfWeek,
  getStartOfMonth,
  getOptionalStartOfMonth,
  getEndOfMonth,
  getOptionalEndOfMonth,
  getStartOfYear,
  getOptionalStartOfYear,
  getEndOfYear,
  getOptionalEndOfYear,
} from './getDatePeriodBounds'

describe('getDatePeriodBounds', () => {
  // Test date: 2024-03-15 23:45:00 UTC+2 (21:45:00 UTC)
  const testDate = new Date('2024-03-15T21:45:00.000Z')
  const timeZone = 'Europe/Paris' // UTC+2 in March

  describe('day', () => {
    it('should get start of day in timezone', () => {
      const result = getStartOfDay(testDate, timeZone)
      expect(result.toISOString()).toBe('2024-03-15T22:00:00.000Z') // 00:00:00 UTC+2
    })

    it('should get end of day in timezone', () => {
      const result = getEndOfDay(testDate, timeZone)
      expect(result.toISOString()).toBe('2024-03-16T21:59:59.999Z') // 23:59:59 UTC+2
    })

    it('should handle null date for optional start', () => {
      expect(getOptionalStartOfDay(null, timeZone)).toBeNull()
    })

    it('should handle null date for optional end', () => {
      expect(getOptionalEndOfDay(null, timeZone)).toBeNull()
    })
  })

  describe('week', () => {
    it('should get start of week in timezone', () => {
      const result = getStartOfWeek(testDate, timeZone)
      expect(result.toISOString()).toBe('2024-03-11T22:00:00.000Z') // Monday 00:00:00 UTC+2
    })

    it('should get end of week in timezone', () => {
      const result = getEndOfWeek(testDate, timeZone)
      expect(result.toISOString()).toBe('2024-03-17T21:59:59.999Z') // Sunday 23:59:59 UTC+2
    })

    it('should handle null date for optional start', () => {
      expect(getOptionalStartOfWeek(null, timeZone)).toBeNull()
    })

    it('should handle null date for optional end', () => {
      expect(getOptionalEndOfWeek(null, timeZone)).toBeNull()
    })
  })

  describe('month', () => {
    it('should get start of month in timezone', () => {
      const result = getStartOfMonth(testDate, timeZone)
      expect(result.toISOString()).toBe('2024-02-29T23:00:00.000Z') // March 1st 00:00:00 UTC+2
    })

    it('should get end of month in timezone', () => {
      const result = getEndOfMonth(testDate, timeZone)
      expect(result.toISOString()).toBe('2024-03-31T21:59:59.999Z') // March 31st 23:59:59 UTC+2
    })

    it('should handle null date for optional start', () => {
      expect(getOptionalStartOfMonth(null, timeZone)).toBeNull()
    })

    it('should handle null date for optional end', () => {
      expect(getOptionalEndOfMonth(null, timeZone)).toBeNull()
    })
  })

  describe('year', () => {
    it('should get start of year in timezone', () => {
      const result = getStartOfYear(testDate, timeZone)
      expect(result.toISOString()).toBe('2023-12-31T23:00:00.000Z') // Jan 1st 00:00:00 UTC+2
    })

    it('should get end of year in timezone', () => {
      const result = getEndOfYear(testDate, timeZone)
      expect(result.toISOString()).toBe('2024-12-31T22:59:59.999Z') // Dec 31st 23:59:59 UTC+2
    })

    it('should handle null date for optional start', () => {
      expect(getOptionalStartOfYear(null, timeZone)).toBeNull()
    })

    it('should handle null date for optional end', () => {
      expect(getOptionalEndOfYear(null, timeZone)).toBeNull()
    })
  })

  describe('timezone edge cases', () => {
    // Test date: 2024-03-15 23:45:00 UTC+2 (21:45:00 UTC)
    const edgeCaseDate = new Date('2024-03-15T21:45:00.000Z')
    const utcPlus2 = 'Europe/Paris' // UTC+2 in March
    const utcMinus12 = 'Pacific/Auckland' // UTC+12 in March

    it('should handle different timezone for start of day', () => {
      const result = getStartOfDay(edgeCaseDate, utcMinus12)
      expect(result.toISOString()).toBe('2024-03-15T12:00:00.000Z') // 00:00:00 UTC+12
    })

    it('should handle different timezone for end of day', () => {
      const result = getEndOfDay(edgeCaseDate, utcMinus12)
      expect(result.toISOString()).toBe('2024-03-16T11:59:59.999Z') // 23:59:59 UTC+12
    })

    it('should handle timezone change during DST', () => {
      // Test date during DST change: 2024-03-31 02:30:00 UTC+2 (00:30:00 UTC)
      const dstDate = new Date('2024-03-31T00:30:00.000Z')
      const result = getStartOfDay(dstDate, utcPlus2)
      expect(result.toISOString()).toBe('2024-03-30T22:00:00.000Z') // 00:00:00 UTC+2
    })
  })
})
