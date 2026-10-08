import type { Prisma } from '@app/web/generated/prisma/client'

export const actifFilter = (lastActivity: {
  lt?: Date
  gte?: Date
}): Prisma.UserWhereInput => ({
  role: { not: 'Admin' },
  deleted: null,
  inscriptionValidee: { not: null },
  OR: [
    {
      lastSeen: lastActivity,
      mediateur: { is: null },
      coordinateur: {
        is: {
          OR: [
            { derniereCreationActivite: { not: null } },
            { mediateursCoordonnes: { some: { suppression: null } } },
          ],
        },
      },
    },
    {
      coordinateur: { is: null },
      mediateur: { is: { derniereCreationActivite: lastActivity } },
    },
    {
      lastSeen: lastActivity,
      mediateur: { isNot: null },
      coordinateur: {
        is: {
          OR: [
            { derniereCreationActivite: { not: null } },
            { mediateursCoordonnes: { some: { suppression: null } } },
          ],
        },
      },
    },
  ],
})
