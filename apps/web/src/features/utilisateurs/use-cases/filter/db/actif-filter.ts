import type { Prisma } from '@prisma/client'

export const actifFilter = (lastActivity: {
  lt?: Date
  gte?: Date
}): Prisma.UserWhereInput => ({
  role: { not: 'Admin' },
  deleted: null,
  inscriptionValidee: { not: null },
  OR: [
    {
      lastLogin: lastActivity,
      mediateur: { is: null },
      coordinateur: {
        is: {
          OR: [
            { derniereCreationActivite: { not: null } },
            { mediateursCoordonnes: { some: {} } },
          ],
        },
      },
    },
    {
      coordinateur: { is: null },
      mediateur: { is: { derniereCreationActivite: lastActivity } },
    },
    {
      lastLogin: lastActivity,
      mediateur: { isNot: null },
      coordinateur: {
        is: {
          OR: [
            { derniereCreationActivite: { not: null } },
            { mediateursCoordonnes: { some: {} } },
          ],
        },
      },
    },
  ],
})
