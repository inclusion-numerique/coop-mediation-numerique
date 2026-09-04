import { CLOSED_SCHEDULE } from '@gouvfr-anct/timetable-to-osm-opening-hours'
import { safeToTimetableOpeningHours } from './openingHoursHelpers'

describe('safeToTimetableOpeningHours', () => {
  it('returns an empty week instead of throwing on a malformed unquoted comment', () => {
    const malformed =
      'Mo 08:30-12:00 Un Lundi sur deux,calendrier disponible sur https://www.espritquiclic.com/calendrier'

    expect(safeToTimetableOpeningHours(new Date())(malformed)).toEqual(
      CLOSED_SCHEDULE,
    )
  })

  it('returns an empty week for null input', () => {
    expect(safeToTimetableOpeningHours(new Date())(null)).toEqual(
      CLOSED_SCHEDULE,
    )
  })

  it('parses a valid OSM string', () => {
    const result = safeToTimetableOpeningHours(new Date())('Mo 08:30-12:00')

    expect(result.Mo.am).toEqual({
      startTime: '08:30',
      endTime: '12:00',
      isOpen: true,
    })
  })
})
