import { describe, expect, it } from 'vitest'
import { dateAsMonth, dateAsMonthFull } from '@/utils/dateAsMonth'

describe('dateAsMonth', () => {
  describe('dateAsMonth', () => {
    it('formats date', () => {
      expect(dateAsMonth(new Date('2023-02-16T07:48:58'))).toEqual('02/2023')
    })
  })

  describe('dateAsMonthFull', () => {
    it('formats date', () => {
      expect(dateAsMonthFull(new Date('2023-02-16T07:48:58'))).toEqual(
        'février 2023',
      )
    })
  })
})
