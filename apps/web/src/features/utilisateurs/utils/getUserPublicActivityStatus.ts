import { dateAsDay } from '@app/web/utils/dateAsDay'
import { isAfter, subMonths } from 'date-fns'

export type UserPublicActivityStatusSlug = 'actif' | 'inactif'

export type UserPublicActivityStatus = {
  status: UserPublicActivityStatusSlug
  label: string
}

export const getUserPublicActivityStatus = ({
  lastActivityDate,
}: {
  lastActivityDate: Date | null
}): UserPublicActivityStatus => {
  if (lastActivityDate == null) return { status: 'inactif', label: 'Inactif' }

  if (isAfter(lastActivityDate, subMonths(new Date(), 2))) {
    return { status: 'actif', label: 'Actif' }
  }
  return {
    status: 'inactif',
    label: `Inactif depuis le ${dateAsDay(lastActivityDate)}`,
  }
}
