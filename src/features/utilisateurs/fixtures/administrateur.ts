import { utilisateur } from '@/features/utilisateurs/fixtures/utilisateur'
import type { Prisma } from '@/generated/prisma/client'

export const administrateur = utilisateur({
  id: 'bd74893d-34fc-4d21-bfea-fe31b99b66a0',
  firstName: 'Administrateur',
  lastName: 'Test',
  isFixture: true,
  role: 'Admin',
}) satisfies Prisma.UserCreateInput
