import { UserTimezone } from '@app/web/utils/user'

export const addTimezoneToActivite =
  <
    T extends {
      date: Date
    },
  >(
    user: UserTimezone,
  ) =>
  (
    activite: T,
  ): T & {
    timezone: string
  } => ({
    ...activite,
    timezone: user.timezone,
  })
