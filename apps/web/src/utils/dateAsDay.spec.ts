import {
  dateAsDay,
  dateAsDayConventional,
  dateAsDayFullWordsInTimezone,
  dateAsDayWithHourInTimezone,
} from '@app/web/utils/dateAsDay'

describe('dateAsDay', () => {
  it('formats date', () => {
    expect(dateAsDay(new Date('2023-02-16T07:48:58'))).toEqual('16.02.2023')
  })
})

describe('dateAsDayWithHourInTimezone', () => {
  it('formats date with hour in Europe/Paris timezone', () => {
    expect(
      dateAsDayWithHourInTimezone(
        new Date('2023-02-16T07:48:58Z'),
        'Europe/Paris',
      ),
    ).toEqual('16.02.2023 à 08h48')
  })

  it('formats date with afternoon hour in Europe/Paris timezone (summer time)', () => {
    expect(
      dateAsDayWithHourInTimezone(
        new Date('2023-07-16T14:05:00Z'),
        'Europe/Paris',
      ),
    ).toEqual('16.07.2023 à 16h05')
  })
})

describe('dateAsDayConventional', () => {
  it('formats date with slashes', () => {
    expect(dateAsDayConventional(new Date('2023-02-16T07:48:58'))).toEqual(
      '16/02/2023',
    )
  })
})

describe('dateAsDayFullWordsInTimezone', () => {
  it('formats date with full words in Paris timezone', () => {
    expect(
      dateAsDayFullWordsInTimezone(
        new Date('2023-02-16T07:48:58Z'),
        'Europe/Paris',
      ),
    ).toEqual('jeudi 16 février')
  })

  it('formats date with full words accounting for timezone offset', () => {
    expect(
      dateAsDayFullWordsInTimezone(
        new Date('2023-02-16T23:30:00Z'),
        'Europe/Paris',
      ),
    ).toEqual('vendredi 17 février')
  })
})
