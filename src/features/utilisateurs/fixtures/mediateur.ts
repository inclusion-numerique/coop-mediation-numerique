import { utilisateur } from '@/features/utilisateurs/fixtures/utilisateur'
import type { Prisma } from '@/generated/prisma/client'

export type MediateurAFabriquer = {
  firstName: string
  lastName: string
  email: string
  id: string
  mediateurId: string
  emploiId: string
}

export const mediateur = ({
  firstName,
  lastName,
  email,
  id,
  mediateurId,
  emploiId,
}: MediateurAFabriquer) =>
  utilisateur({
    id,
    firstName,
    lastName,
    email,
    role: 'User',
    inscriptionValidee: new Date('2025-04-29'),
    lieuxActiviteRenseignes: new Date('2025-04-29'),
    structureEmployeuseRenseignee: new Date('2025-04-29'),
    mediateur: {
      connectOrCreate: {
        where: {
          id: mediateurId,
        },
        create: {
          id: mediateurId,
        },
      },
    },
    employeDeLaStructureEmployeuse: true,
  }) satisfies Prisma.UserCreateInput
