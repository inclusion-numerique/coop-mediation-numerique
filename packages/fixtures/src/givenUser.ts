import { createSlug } from '@app/web/utils/createSlug'
import type { Prisma, UserRole } from '@prisma/client'
import { v4 } from 'uuid'

export const givenUser = <
  T extends Partial<Prisma.UserCreateInput> & {
    isConseillerNumerique?: boolean
  },
>(
  data: T,
): Omit<
  T,
  | 'id'
  | 'email'
  | 'firstName'
  | 'lastName'
  | 'name'
  | 'emailVerified'
  | 'role'
  | 'timezone'
  | 'isConseillerNumerique'
> & {
  id: string
  email: string
  firstName: string
  lastName: string
  name: string
  emailVerified: string | Date
  role: UserRole
  timezone: string
  /**
   * Intention de fixture, PAS une colonne : `coop.users.is_conseiller_numerique` a disparu, le
   * dispositif se dérivant de l'affectation `idposte` (ADR-002). `seedPersonnesMain` lit ce drapeau
   * pour semer l'affectation correspondante dans `main`, et `upsertUserFixture` l'écarte avant
   * d'écrire la ligne.
   */
  isConseillerNumerique: boolean
} => {
  const {
    role,
    email,
    emailVerified,
    firstName,
    lastName,
    name,
    id,
    timezone,
    isConseillerNumerique,
    ...rest
  } = data

  const givenId = id ?? v4()
  const givenFirstName = firstName ?? 'Jean'
  const givenLastName = lastName ?? 'Biche'
  const givenName = name ?? `${givenFirstName} ${givenLastName}`
  const givenSlug = createSlug(givenName)
  const givenRole = role ?? 'User'
  const givenEmailVerified = emailVerified ?? new Date('2024-04-11')
  const givenEmail = email ?? `${givenSlug}@coop-numerique.anct.gouv.fr`
  const givenTimezone = timezone ?? 'Europe/Paris'
  const givenIsConseillerNumerique = isConseillerNumerique ?? false

  return {
    id: givenId,
    email: givenEmail,
    firstName: givenFirstName,
    lastName: givenLastName,
    name: givenName,
    role: givenRole,
    emailVerified: givenEmailVerified,
    timezone: givenTimezone,
    ...rest,
    isConseillerNumerique: givenIsConseillerNumerique,
  }
}
