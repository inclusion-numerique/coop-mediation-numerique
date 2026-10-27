import { givenUser } from '@app/fixtures/givenUser'
import { mediateque } from '@app/fixtures/structures'
import type { Prisma } from '@app/web/generated/prisma/client'

export type GivenMediateurInput = {
  firstName: string
  lastName: string
  email: string
  id: string
  mediateurId: string
  enActiviteId: string
  emploiId: string
}

export const givenMediateur = ({
  firstName,
  lastName,
  email,
  id,
  mediateurId,
  enActiviteId,
  emploiId,
}: GivenMediateurInput) =>
  givenUser({
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
          enActivite: {
            connectOrCreate: {
              where: {
                id: enActiviteId,
              },
              create: {
                id: enActiviteId,
                structureId: mediateque.id,
                debut: new Date(),
              },
            },
          },
        },
      },
    },
    employeDeLaStructureEmployeuse: true,
  }) satisfies Prisma.UserCreateInput
