import {
  dateAsDayAndTime,
  dateAsDayAndTimeInTimeZone,
  dateAsDayInTimeZone,
  dateAsTime,
  dateAsTimeInTimeZone,
} from '@app/web/utils/dateAsDayAndTime'

describe('dateAsDayAndTime', () => {
  describe('dateAsDayAndTime', () => {
    it('formats date', () => {
      expect(dateAsDayAndTime(new Date('2023-02-16T07:48:58'))).toEqual(
        '16/02/2023 07h48',
      )
    })
  })

  describe('dateAsDayInTimeZone', () => {
    it('formats date in locale timezone', () => {
      expect(
        dateAsDayInTimeZone(new Date('2023-02-16T23:48:58'), 'Europe/Paris'),
      ).toEqual('17.02.2023')
    })
  })

  describe('dateAsDayAndTimeInTimeZone', () => {
    it('formats date in locale timezone', () => {
      expect(
        dateAsDayAndTimeInTimeZone(
          new Date('2023-02-16T07:48:58'),
          'Europe/Paris',
        ),
      ).toEqual('16/02/2023 08h48')
    })
  })

  describe('dateAsTime', () => {
    it('formats date', () => {
      expect(dateAsTime(new Date('2023-02-16T07:48:58'))).toEqual('07h48')
    })
  })

  describe('dateAsTimeInTimeZone', () => {
    it('formats date in locale timezone', () => {
      expect(
        dateAsTimeInTimeZone(new Date('2023-02-16T07:48:58'), 'Europe/Paris'),
      ).toEqual('08h48')
    })
  })
})
