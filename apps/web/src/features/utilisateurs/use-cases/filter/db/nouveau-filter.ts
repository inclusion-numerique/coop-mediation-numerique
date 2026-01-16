import type { OnboardingStatus, Prisma } from '@prisma/client'

const noActivityFilter: Prisma.UserWhereInput[] = [
  {
    mediateur: { is: null },
    coordinateur: {
      is: {
        derniereCreationActivite: null,
        mediateursCoordonnes: { none: {} },
      },
    },
  },
  {
    coordinateur: { is: null },
    mediateur: { is: { derniereCreationActivite: null } },
  },
  {
    mediateur: { is: { derniereCreationActivite: null } },
    coordinateur: {
      is: {
        derniereCreationActivite: null,
        mediateursCoordonnes: { none: {} },
      },
    },
  },
]

export const nouveauFilter = (
  inscriptionValidee: { lt?: Date; gte?: Date },
  previousOnboardingStatus: (OnboardingStatus | null)[] = [],
): Prisma.UserWhereInput => ({
  inscriptionValidee,
  role: { not: 'Admin' },
  deleted: null,
  ...(previousOnboardingStatus.length > 0
    ? {
        OR: previousOnboardingStatus.map((status) => ({
          onboardingStatus: status,
        })),
        AND: [{ OR: noActivityFilter }],
      }
    : { OR: noActivityFilter }),
})
