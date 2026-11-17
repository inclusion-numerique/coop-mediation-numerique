import { givenUser } from '@app/web/features/utilisateurs/fixtures/givenUser'
import type { Prisma } from '@app/web/generated/prisma/client'

export const administrateur = givenUser({
  id: 'bd74893d-34fc-4d21-bfea-fe31b99b66a0',
  firstName: 'Administrateur',
  lastName: 'Test',
  isFixture: true,
  role: 'Admin',
}) satisfies Prisma.UserCreateInput
