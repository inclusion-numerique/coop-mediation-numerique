import {
  CLOSED_SCHEDULE,
  type Schedule,
  toTimetableOpeningHours,
} from '@gouvfr-anct/timetable-to-osm-opening-hours'

export const safeToTimetableOpeningHours =
  (date: Date) =>
  (horairesOSM: string | null): Schedule => {
    try {
      return toTimetableOpeningHours(date)(horairesOSM ?? undefined)
    } catch {
      return CLOSED_SCHEDULE
    }
  }
