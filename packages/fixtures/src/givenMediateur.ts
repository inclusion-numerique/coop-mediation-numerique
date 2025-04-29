import { givenUser } from '@app/fixtures/givenUser'
import { mediateque, structureEmployeuse } from '@app/fixtures/structures'
import type { UserFeatureFlag, Prisma } from '@prisma/client'

export type GivenMediateurInput = {
  firstName: string
  lastName: string
  email: string
  id: string
  mediateurId: string
  enActiviteId: string
  emploiId: string
  featureFlags?: UserFeatureFlag[]
}

export const givenMediateur = ({
  firstName,
  lastName,
  email,
  id,
  mediateurId,
  enActiviteId,
  emploiId,
  featureFlags = ['RdvServicePublic'],
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
    featureFlags,
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
              },
            },
          },
        },
      },
    },
    emplois: {
      connectOrCreate: {
        where: {
          id: emploiId,
        },
        create: {
          id: emploiId,
          structureId: structureEmployeuse.id,
        },
      },
    },
  }) satisfies Prisma.UserCreateInput
